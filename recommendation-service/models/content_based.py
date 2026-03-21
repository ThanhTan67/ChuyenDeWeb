"""
Content-Based Filtering — TF-IDF + Cosine Similarity.
Builds product profiles from name + description + category + brand.
"""
import logging
import numpy as np
import joblib
from pathlib import Path
from typing import List, Tuple, Dict, Optional

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


class ContentBasedModel:
    """TF-IDF content-based product similarity."""

    def __init__(self, max_features: int = 5000):
        self.max_features = max_features
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.product_ids: List[int] = []
        self.pid_to_idx: Dict[int, int] = {}
        self.trained = False

    def train(self, products_df) -> dict:
        """
        Build TF-IDF matrix from product corpus.
        products_df must have: product_id, product_name, description, category_name, brand_name
        """
        if products_df.empty:
            logger.warning("Empty product DataFrame, skipping content model training")
            return {"status": "skipped", "reason": "no data"}

        self.product_ids = products_df["product_id"].tolist()
        self.pid_to_idx = {pid: idx for idx, pid in enumerate(self.product_ids)}

        # Build corpus: concat all text fields
        corpus = []
        for _, row in products_df.iterrows():
            parts = [
                str(row.get("product_name", "") or ""),
                str(row.get("description", "") or ""),
                str(row.get("category_name", "") or ""),
                str(row.get("brand_name", "") or ""),
            ]
            corpus.append(" ".join(parts))

        # Fit TF-IDF
        self.vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            stop_words=None,  # Keep all for product names
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95,
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

        self.trained = True
        logger.info(
            "Content model trained: %d products, %d features",
            len(self.product_ids),
            self.tfidf_matrix.shape[1],
        )
        return {
            "status": "trained",
            "n_products": len(self.product_ids),
            "n_features": int(self.tfidf_matrix.shape[1]),
        }

    def get_similar(
        self,
        product_id: int,
        n: int = 10,
        exclude_ids: set = None,
    ) -> List[Tuple[int, float]]:
        """Find top-N similar products to a given product."""
        if not self.trained or product_id not in self.pid_to_idx:
            return []

        idx = self.pid_to_idx[product_id]
        sim_scores = cosine_similarity(
            self.tfidf_matrix[idx:idx+1],
            self.tfidf_matrix,
        ).flatten()

        exclude = exclude_ids or set()
        exclude.add(product_id)

        scored = [
            (self.product_ids[i], float(sim_scores[i]))
            for i in range(len(self.product_ids))
            if self.product_ids[i] not in exclude
        ]
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:n]

    def get_user_profile_recommendations(
        self,
        purchased_ids: List[int],
        candidate_ids: List[int],
        n: int = 10,
    ) -> List[Tuple[int, float]]:
        """
        Build user profile from purchased products and find similar candidates.
        User profile = mean TF-IDF vector of purchased items.
        """
        if not self.trained or not purchased_ids:
            return []

        # Build user profile vector (mean of purchased items' TF-IDF)
        valid_indices = [
            self.pid_to_idx[pid]
            for pid in purchased_ids
            if pid in self.pid_to_idx
        ]
        if not valid_indices:
            return []

        user_profile = self.tfidf_matrix[valid_indices].mean(axis=0)
        user_profile = np.asarray(user_profile)

        # Score candidates
        candidate_indices = [
            self.pid_to_idx[pid]
            for pid in candidate_ids
            if pid in self.pid_to_idx
        ]
        if not candidate_indices:
            return []

        candidate_matrix = self.tfidf_matrix[candidate_indices]
        sim_scores = cosine_similarity(user_profile, candidate_matrix).flatten()

        scored = [
            (candidate_ids[i] if candidate_ids[i] in self.pid_to_idx else candidate_ids[i], float(sim_scores[j]))
            for j, i in enumerate(range(len(candidate_indices)))
        ]

        # Re-map correctly
        valid_candidates = [pid for pid in candidate_ids if pid in self.pid_to_idx]
        scored = list(zip(valid_candidates, sim_scores.tolist()))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:n]

    def get_all_scores(
        self,
        purchased_ids: List[int],
        candidate_ids: List[int],
    ) -> Dict[int, float]:
        """Score all candidates based on user profile similarity."""
        if not self.trained or not purchased_ids:
            return {}

        valid_indices = [
            self.pid_to_idx[pid]
            for pid in purchased_ids
            if pid in self.pid_to_idx
        ]
        if not valid_indices:
            return {}

        user_profile = np.asarray(self.tfidf_matrix[valid_indices].mean(axis=0))

        result = {}
        for pid in candidate_ids:
            if pid in self.pid_to_idx:
                idx = self.pid_to_idx[pid]
                sim = cosine_similarity(
                    user_profile,
                    self.tfidf_matrix[idx:idx+1],
                ).flatten()[0]
                result[pid] = float(sim)
            else:
                result[pid] = 0.0
        return result

    def save(self, path: Path):
        """Save model to disk."""
        joblib.dump({
            "vectorizer": self.vectorizer,
            "tfidf_matrix": self.tfidf_matrix,
            "product_ids": self.product_ids,
            "pid_to_idx": self.pid_to_idx,
            "max_features": self.max_features,
            "trained": self.trained,
        }, path)
        logger.info("Content model saved to %s", path)

    def load(self, path: Path):
        """Load model from disk."""
        data = joblib.load(path)
        self.vectorizer = data["vectorizer"]
        self.tfidf_matrix = data["tfidf_matrix"]
        self.product_ids = data["product_ids"]
        self.pid_to_idx = data["pid_to_idx"]
        self.max_features = data["max_features"]
        self.trained = data["trained"]
        logger.info("Content model loaded from %s", path)
