"""
SVD Matrix Factorization — pure numpy SGD implementation.
No external dependency (no scikit-surprise).

Model: predict(u, i) = mu + b_u[u] + b_i[i] + P[u] · Q[i]
Training: SGD with L2 regularization on biases and latent factors.
"""
import logging
import numpy as np
import joblib
from pathlib import Path
from typing import List, Tuple, Dict, Optional

from data.preprocessor import IndexMapper

logger = logging.getLogger(__name__)


class SVDModel:
    """SVD-based collaborative filtering with biases."""

    def __init__(
        self,
        n_factors: int = 50,
        n_epochs: int = 20,
        lr: float = 0.005,
        reg: float = 0.02,
    ):
        self.n_factors = n_factors
        self.n_epochs = n_epochs
        self.lr = lr
        self.reg = reg

        # Will be set during training
        self.user_mapper = IndexMapper()
        self.item_mapper = IndexMapper()
        self.P: Optional[np.ndarray] = None  # user factors
        self.Q: Optional[np.ndarray] = None  # item factors
        self.b_u: Optional[np.ndarray] = None  # user biases
        self.b_i: Optional[np.ndarray] = None  # item biases
        self.mu: float = 0.0  # global mean
        self.trained = False

    def train(self, df) -> dict:
        """
        Train SVD from interaction DataFrame.
        df must have columns: user_id, product_id, rating
        Returns training metrics.
        """
        if df.empty:
            logger.warning("Empty DataFrame, skipping SVD training")
            return {"status": "skipped", "reason": "no data"}

        # Build index mappings
        self.user_mapper.fit(df["user_id"])
        self.item_mapper.fit(df["product_id"])

        n_users = self.user_mapper.size
        n_items = self.item_mapper.size

        user_idx = self.user_mapper.transform(df["user_id"])
        item_idx = self.item_mapper.transform(df["product_id"])
        ratings = df["rating"].values.astype(np.float64)

        self.mu = float(np.mean(ratings))

        # Initialize latent factors and biases
        rng = np.random.RandomState(42)
        self.P = rng.normal(0, 0.1, (n_users, self.n_factors))
        self.Q = rng.normal(0, 0.1, (n_items, self.n_factors))
        self.b_u = np.zeros(n_users)
        self.b_i = np.zeros(n_items)

        # SGD training
        n_samples = len(ratings)
        logger.info(
            "Training SVD: %d users × %d items, %d interactions, %d factors",
            n_users, n_items, n_samples, self.n_factors,
        )

        losses = []
        for epoch in range(self.n_epochs):
            # Shuffle
            perm = rng.permutation(n_samples)
            total_loss = 0.0

            for idx in perm:
                u = user_idx[idx]
                i = item_idx[idx]
                r = ratings[idx]

                # Prediction
                pred = self.mu + self.b_u[u] + self.b_i[i] + self.P[u] @ self.Q[i]
                err = r - pred
                total_loss += err ** 2

                # SGD updates
                self.b_u[u] += self.lr * (err - self.reg * self.b_u[u])
                self.b_i[i] += self.lr * (err - self.reg * self.b_i[i])

                p_u = self.P[u].copy()
                self.P[u] += self.lr * (err * self.Q[i] - self.reg * self.P[u])
                self.Q[i] += self.lr * (err * p_u - self.reg * self.Q[i])

            rmse = np.sqrt(total_loss / n_samples)
            losses.append(rmse)
            if (epoch + 1) % 5 == 0 or epoch == 0:
                logger.info("SVD Epoch %d/%d — RMSE: %.4f", epoch + 1, self.n_epochs, rmse)

        self.trained = True
        return {
            "status": "trained",
            "n_users": n_users,
            "n_items": n_items,
            "n_interactions": n_samples,
            "final_rmse": float(losses[-1]),
        }

    def predict(self, user_id: int, product_id: int) -> float:
        """Predict rating for a single (user, item) pair."""
        if not self.trained:
            return self.mu if self.mu else 3.0

        if not self.user_mapper.contains(user_id):
            return self.mu
        if not self.item_mapper.contains(product_id):
            return self.mu

        u = self.user_mapper.id_to_idx[user_id]
        i = self.item_mapper.id_to_idx[product_id]
        return float(self.mu + self.b_u[u] + self.b_i[i] + self.P[u] @ self.Q[i])

    def get_top_n(
        self,
        user_id: int,
        candidate_ids: List[int],
        n: int = 10,
    ) -> List[Tuple[int, float]]:
        """
        Score all candidate items for a user and return top-N.
        Returns: List of (product_id, predicted_score).
        """
        if not self.trained or not self.user_mapper.contains(user_id):
            return []

        u = self.user_mapper.id_to_idx[user_id]
        scores = []

        for pid in candidate_ids:
            if not self.item_mapper.contains(pid):
                scores.append((pid, self.mu))
                continue
            i = self.item_mapper.id_to_idx[pid]
            pred = self.mu + self.b_u[u] + self.b_i[i] + self.P[u] @ self.Q[i]
            scores.append((pid, float(pred)))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:n]

    def get_all_scores(self, user_id: int, candidate_ids: List[int]) -> Dict[int, float]:
        """Score all candidates, return dict."""
        if not self.trained or not self.user_mapper.contains(user_id):
            return {}
        result = {}
        u = self.user_mapper.id_to_idx[user_id]
        for pid in candidate_ids:
            if self.item_mapper.contains(pid):
                i = self.item_mapper.id_to_idx[pid]
                result[pid] = float(self.mu + self.b_u[u] + self.b_i[i] + self.P[u] @ self.Q[i])
            else:
                result[pid] = self.mu
        return result

    def save(self, path: Path):
        """Save model to disk."""
        joblib.dump({
            "P": self.P, "Q": self.Q,
            "b_u": self.b_u, "b_i": self.b_i,
            "mu": self.mu,
            "user_mapper": self.user_mapper,
            "item_mapper": self.item_mapper,
            "n_factors": self.n_factors,
            "trained": self.trained,
        }, path)
        logger.info("SVD model saved to %s", path)

    def load(self, path: Path):
        """Load model from disk."""
        data = joblib.load(path)
        self.P = data["P"]
        self.Q = data["Q"]
        self.b_u = data["b_u"]
        self.b_i = data["b_i"]
        self.mu = data["mu"]
        self.user_mapper = data["user_mapper"]
        self.item_mapper = data["item_mapper"]
        self.n_factors = data["n_factors"]
        self.trained = data["trained"]
        logger.info("SVD model loaded from %s", path)
