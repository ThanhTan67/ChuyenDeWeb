"""
Rule-Based Scoring — Trending, Top-Selling, Bayesian Rating.
No ML training required; scores computed live from DB data.
"""
import logging
import math
from typing import Dict, List, Tuple

import pandas as pd

from data import data_loader

logger = logging.getLogger(__name__)


class RuleBasedModel:
    """Combines trending, top-selling, and Bayesian rating signals."""

    # Weights for combining the 3 sub-signals
    W_TRENDING = 0.40
    W_SELLING = 0.35
    W_RATING = 0.25

    # Bayesian prior
    PRIOR_C = 5       # pseudo-count (confidence parameter)
    PRIOR_M = 3.0     # prior mean rating

    def __init__(self):
        self.trained = False

    def get_trending_scores(self, days: int = 7) -> Dict[int, float]:
        """
        Trending score based on recent order volume.
        """
        df = data_loader.load_recent_orders(days=days)
        if df.empty:
            return {}

        max_sold = df["recent_sold"].max()
        if max_sold == 0:
            return {}

        return {
            int(row["product_id"]): float(row["recent_sold"]) / max_sold
            for _, row in df.iterrows()
        }

    def get_top_selling_scores(self) -> Dict[int, float]:
        """
        All-time top-selling normalized score.
        """
        df = data_loader.load_order_history()
        if df.empty:
            return {}

        max_sold = df["total_sold"].max()
        if max_sold == 0:
            return {}

        return {
            int(row["product_id"]): float(row["total_sold"]) / max_sold
            for _, row in df.iterrows()
        }

    def get_bayesian_rating_scores(self, min_reviews: int = 2) -> Dict[int, float]:
        """
        Bayesian average rating: (C*M + sum_ratings) / (C + n_reviews)
        Normalized to [0, 1] by dividing by 5.
        """
        df = data_loader.load_review_stats()
        if df.empty:
            return {}

        scores = {}
        for _, row in df.iterrows():
            n = int(row["review_count"])
            if n < min_reviews:
                continue
            sum_r = float(row["sum_rating"])
            bayesian = (self.PRIOR_C * self.PRIOR_M + sum_r) / (self.PRIOR_C + n)
            scores[int(row["product_id"])] = bayesian / 5.0  # normalize to [0, 1]

        return scores

    def get_combined_scores(
        self,
        product_ids: List[int],
        days: int = 7,
        min_reviews: int = 2,
    ) -> Dict[int, float]:
        """
        Combine trending + top-selling + Bayesian into a single rule score.
        """
        trending = self.get_trending_scores(days)
        selling = self.get_top_selling_scores()
        rating = self.get_bayesian_rating_scores(min_reviews)

        scores = {}
        for pid in product_ids:
            t = trending.get(pid, 0.0)
            s = selling.get(pid, 0.0)
            r = rating.get(pid, self.PRIOR_M / 5.0)  # default prior
            scores[pid] = (
                self.W_TRENDING * t +
                self.W_SELLING * s +
                self.W_RATING * r
            )
        return scores

    def get_top_trending(self, n: int = 10, days: int = 7) -> List[Tuple[int, float]]:
        """Top-N trending products."""
        scores = self.get_trending_scores(days)
        sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_items[:n]

    def get_top_selling(self, n: int = 10) -> List[Tuple[int, float]]:
        """Top-N best-selling products."""
        scores = self.get_top_selling_scores()
        sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_items[:n]

    def get_top_rated(self, n: int = 10, min_reviews: int = 2) -> List[Tuple[int, float]]:
        """Top-N highest rated products (Bayesian average)."""
        scores = self.get_bayesian_rating_scores(min_reviews)
        sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_items[:n]
