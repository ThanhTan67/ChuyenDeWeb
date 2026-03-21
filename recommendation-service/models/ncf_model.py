"""
Neural Collaborative Filtering (NeuMF) — PyTorch implementation.
Combines Generalized Matrix Factorization (GMF) + Multi-Layer Perceptron (MLP).

Reference: He et al., "Neural Collaborative Filtering", WWW 2017.
"""
import logging
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import joblib
from pathlib import Path
from typing import List, Tuple, Dict, Optional

from data.preprocessor import IndexMapper

logger = logging.getLogger(__name__)

# ── Device selection ─────────────────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ── Dataset ──────────────────────────────────────────────────────────
class InteractionDataset(Dataset):
    """User-item interaction dataset with negative sampling."""

    def __init__(self, user_idx, item_idx, labels):
        self.user_idx = torch.LongTensor(user_idx)
        self.item_idx = torch.LongTensor(item_idx)
        self.labels = torch.FloatTensor(labels)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return self.user_idx[idx], self.item_idx[idx], self.labels[idx]


# ── NeuMF Network ───────────────────────────────────────────────────
class NeuMF(nn.Module):
    """
    Neural Matrix Factorization: GMF + MLP combined.
    """

    def __init__(self, n_users: int, n_items: int, embed_dim: int, hidden_layers: list):
        super().__init__()

        # GMF path
        self.gmf_user_embed = nn.Embedding(n_users, embed_dim)
        self.gmf_item_embed = nn.Embedding(n_items, embed_dim)

        # MLP path
        self.mlp_user_embed = nn.Embedding(n_users, embed_dim)
        self.mlp_item_embed = nn.Embedding(n_items, embed_dim)

        mlp_layers = []
        input_dim = embed_dim * 2
        for h in hidden_layers:
            mlp_layers.append(nn.Linear(input_dim, h))
            mlp_layers.append(nn.ReLU())
            mlp_layers.append(nn.BatchNorm1d(h))
            mlp_layers.append(nn.Dropout(0.2))
            input_dim = h
        self.mlp = nn.Sequential(*mlp_layers)

        # Final prediction
        self.output = nn.Linear(embed_dim + hidden_layers[-1], 1)
        self.sigmoid = nn.Sigmoid()

        self._init_weights()

    def _init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Embedding):
                nn.init.normal_(m.weight, std=0.01)
            elif isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

    def forward(self, user_ids, item_ids):
        # GMF
        gmf_u = self.gmf_user_embed(user_ids)
        gmf_i = self.gmf_item_embed(item_ids)
        gmf_out = gmf_u * gmf_i  # element-wise product

        # MLP
        mlp_u = self.mlp_user_embed(user_ids)
        mlp_i = self.mlp_item_embed(item_ids)
        mlp_input = torch.cat([mlp_u, mlp_i], dim=-1)
        mlp_out = self.mlp(mlp_input)

        # Combine
        concat = torch.cat([gmf_out, mlp_out], dim=-1)
        return self.sigmoid(self.output(concat)).squeeze(-1)


# ── NCF Model Wrapper ────────────────────────────────────────────────
class NCFModel:
    """High-level wrapper for NeuMF training and inference."""

    def __init__(
        self,
        embed_dim: int = 32,
        hidden_layers: list = None,
        n_epochs: int = 20,
        lr: float = 0.001,
        batch_size: int = 256,
        neg_ratio: int = 4,
    ):
        self.embed_dim = embed_dim
        self.hidden_layers = hidden_layers or [64, 32, 16]
        self.n_epochs = n_epochs
        self.lr = lr
        self.batch_size = batch_size
        self.neg_ratio = neg_ratio

        self.user_mapper = IndexMapper()
        self.item_mapper = IndexMapper()
        self.model: Optional[NeuMF] = None
        self.trained = False

    def train(self, df) -> dict:
        """
        Train NeuMF from interaction DataFrame.
        df must have columns: user_id, product_id, rating
        """
        if df.empty:
            logger.warning("Empty DataFrame, skipping NCF training")
            return {"status": "skipped", "reason": "no data"}

        # Build index mappings
        self.user_mapper.fit(df["user_id"])
        self.item_mapper.fit(df["product_id"])
        n_users = self.user_mapper.size
        n_items = self.item_mapper.size

        user_idx = self.user_mapper.transform(df["user_id"])
        item_idx = self.item_mapper.transform(df["product_id"])

        # Build positive interaction set for negative sampling
        pos_set = set(zip(user_idx.tolist(), item_idx.tolist()))

        # Generate negative samples
        rng = np.random.RandomState(42)
        neg_users, neg_items = [], []
        for u, i in pos_set:
            for _ in range(self.neg_ratio):
                neg_i = rng.randint(0, n_items)
                while (u, neg_i) in pos_set:
                    neg_i = rng.randint(0, n_items)
                neg_users.append(u)
                neg_items.append(neg_i)

        # Combine positive + negative
        all_users = np.concatenate([user_idx, np.array(neg_users)])
        all_items = np.concatenate([item_idx, np.array(neg_items)])
        all_labels = np.concatenate([
            np.ones(len(user_idx)),
            np.zeros(len(neg_users)),
        ])

        dataset = InteractionDataset(all_users, all_items, all_labels)
        loader = DataLoader(dataset, batch_size=self.batch_size, shuffle=True)

        # Build model
        self.model = NeuMF(n_users, n_items, self.embed_dim, self.hidden_layers).to(device)
        optimizer = torch.optim.Adam(self.model.parameters(), lr=self.lr, weight_decay=1e-5)
        criterion = nn.BCELoss()

        logger.info(
            "Training NCF (NeuMF): %d users × %d items, %d samples (pos=%d, neg=%d)",
            n_users, n_items, len(all_labels),
            len(user_idx), len(neg_users),
        )

        # Training loop
        self.model.train()
        for epoch in range(self.n_epochs):
            total_loss = 0.0
            n_batches = 0
            for batch_u, batch_i, batch_y in loader:
                batch_u = batch_u.to(device)
                batch_i = batch_i.to(device)
                batch_y = batch_y.to(device)

                pred = self.model(batch_u, batch_i)
                loss = criterion(pred, batch_y)

                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                total_loss += loss.item()
                n_batches += 1

            avg_loss = total_loss / max(n_batches, 1)
            if (epoch + 1) % 5 == 0 or epoch == 0:
                logger.info("NCF Epoch %d/%d — Loss: %.4f", epoch + 1, self.n_epochs, avg_loss)

        self.trained = True
        return {
            "status": "trained",
            "n_users": n_users,
            "n_items": n_items,
            "final_loss": float(avg_loss),
        }

    @torch.no_grad()
    def predict_scores(self, user_id: int, product_ids: List[int]) -> Dict[int, float]:
        """Score a list of products for a user."""
        if not self.trained or self.model is None:
            return {}
        if not self.user_mapper.contains(user_id):
            return {}

        self.model.eval()
        u_idx = self.user_mapper.id_to_idx[user_id]

        valid_pids = [p for p in product_ids if self.item_mapper.contains(p)]
        if not valid_pids:
            return {}

        u_tensor = torch.LongTensor([u_idx] * len(valid_pids)).to(device)
        i_tensor = torch.LongTensor([self.item_mapper.id_to_idx[p] for p in valid_pids]).to(device)

        scores = self.model(u_tensor, i_tensor).cpu().numpy()
        return {pid: float(s) for pid, s in zip(valid_pids, scores)}

    def get_top_n(
        self,
        user_id: int,
        candidate_ids: List[int],
        n: int = 10,
    ) -> List[Tuple[int, float]]:
        """Score all candidates and return top-N."""
        scores = self.predict_scores(user_id, candidate_ids)
        if not scores:
            return []
        sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_items[:n]

    def get_all_scores(self, user_id: int, candidate_ids: List[int]) -> Dict[int, float]:
        """Alias for predict_scores."""
        return self.predict_scores(user_id, candidate_ids)

    def save(self, path: Path):
        """Save model to disk."""
        save_data = {
            "model_state": self.model.state_dict() if self.model else None,
            "user_mapper": self.user_mapper,
            "item_mapper": self.item_mapper,
            "embed_dim": self.embed_dim,
            "hidden_layers": self.hidden_layers,
            "trained": self.trained,
        }
        joblib.dump(save_data, path)
        logger.info("NCF model saved to %s", path)

    def load(self, path: Path):
        """Load model from disk."""
        data = joblib.load(path)
        self.user_mapper = data["user_mapper"]
        self.item_mapper = data["item_mapper"]
        self.embed_dim = data["embed_dim"]
        self.hidden_layers = data["hidden_layers"]
        self.trained = data["trained"]

        if data["model_state"] is not None:
            n_users = self.user_mapper.size
            n_items = self.item_mapper.size
            self.model = NeuMF(n_users, n_items, self.embed_dim, self.hidden_layers).to(device)
            self.model.load_state_dict(data["model_state"])
            self.model.eval()
        logger.info("NCF model loaded from %s", path)
