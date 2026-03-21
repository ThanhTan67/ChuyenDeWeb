"""
Score Fusion — Weighted hybrid combination + MMR diversity reranking.

Combines scores from:
  1. SVD (Collaborative Filtering)
  2. NCF (Neural Collaborative Filtering)
  3. Content-Based (TF-IDF)
  4. Behavior-Based (VIEW/CLICK/ADD_TO_CART/PURCHASE/SEARCH)
  5. Rule-Based (Trending/Top-Selling/Bayesian)

Cold-start handling: redistributes CF weights to content+rule when user has few interactions.
Post-processing: filters already-purchased & out-of-stock; MMR diversity reranking.
"""
import logging
import numpy as np
from typing import Dict, List, Tuple, Optional

from config import (
    WEIGHT_SVD, WEIGHT_NCF, WEIGHT_CONTENT,
    WEIGHT_BEHAVIOR, WEIGHT_RULE, MMR_LAMBDA,
)

logger = logging.getLogger(__name__)


def _normalize(scores: Dict[int, float]) -> Dict[int, float]:
    """Min-max normalize to [0, 1]."""
    if not scores:
        return {}
    values = list(scores.values())
    min_v = min(values)
    max_v = max(values)
    if max_v == min_v:
        return {k: 0.5 for k in scores}
    return {k: (v - min_v) / (max_v - min_v) for k, v in scores.items()}


class ScoreFusion:
    """Weighted hybrid score fusion with cold-start adaptation."""

    COLD_START_THRESHOLD = 3  # interactions below this → cold start

    def __init__(
        self,
        w_svd: float = None,
        w_ncf: float = None,
        w_content: float = None,
        w_behavior: float = None,
        w_rule: float = None,
        mmr_lambda: float = None,
    ):
        self.w_svd = w_svd or WEIGHT_SVD
        self.w_ncf = w_ncf or WEIGHT_NCF
        self.w_content = w_content or WEIGHT_CONTENT
        self.w_behavior = w_behavior or WEIGHT_BEHAVIOR
        self.w_rule = w_rule or WEIGHT_RULE
        self.mmr_lambda = mmr_lambda or MMR_LAMBDA

    def _get_weights(self, n_interactions: int) -> Dict[str, float]:
        """
        Adapt weights based on cold-start detection.
        If user has < COLD_START_THRESHOLD interactions:
          - Zero out CF weights (SVD, NCF)
          - Redistribute to content + behavior + rule
        """
        if n_interactions >= self.COLD_START_THRESHOLD:
            weights = {
                "svd": self.w_svd,
                "ncf": self.w_ncf,
                "content": self.w_content,
                "behavior": self.w_behavior,
                "rule": self.w_rule,
            }
        else:
            # Cold start: redistribute CF weight
            cf_total = self.w_svd + self.w_ncf
            weights = {
                "svd": 0.0,
                "ncf": 0.0,
                "content": self.w_content + cf_total * 0.40,
                "behavior": self.w_behavior + cf_total * 0.30,
                "rule": self.w_rule + cf_total * 0.30,
            }

        # Normalize weights to sum to 1.0
        total = sum(weights.values())
        if total > 0:
            weights = {k: v / total for k, v in weights.items()}
        return weights

    def fuse(
        self,
        svd_scores: Dict[int, float],
        ncf_scores: Dict[int, float],
        content_scores: Dict[int, float],
        behavior_scores: Dict[int, float],
        rule_scores: Dict[int, float],
        n_interactions: int = 0,
        purchased_ids: set = None,
        out_of_stock_ids: set = None,
    ) -> List[Tuple[int, float, Dict[str, float]]]:
        """
        Fuse scores from all models.

        Returns: List of (product_id, final_score, score_breakdown)
                 sorted by final_score descending.
        """
        # Normalize each model's scores
        norm_svd = _normalize(svd_scores)
        norm_ncf = _normalize(ncf_scores)
        norm_content = _normalize(content_scores)
        norm_behavior = _normalize(behavior_scores)
        norm_rule = _normalize(rule_scores)

        # Get adaptive weights
        weights = self._get_weights(n_interactions)
        is_cold_start = n_interactions < self.COLD_START_THRESHOLD

        # Collect all candidate product IDs
        all_pids = set()
        for d in [norm_svd, norm_ncf, norm_content, norm_behavior, norm_rule]:
            all_pids.update(d.keys())

        # STEP 5: Filter already purchased & out-of-stock
        exclude = set()
        if purchased_ids:
            exclude.update(purchased_ids)
        if out_of_stock_ids:
            exclude.update(out_of_stock_ids)

        # Compute fused scores
        results = []
        for pid in all_pids:
            if pid in exclude:
                continue

            s_svd = norm_svd.get(pid, 0.0)
            s_ncf = norm_ncf.get(pid, 0.0)
            s_content = norm_content.get(pid, 0.0)
            s_behavior = norm_behavior.get(pid, 0.0)
            s_rule = norm_rule.get(pid, 0.0)

            final = (
                weights["svd"] * s_svd +
                weights["ncf"] * s_ncf +
                weights["content"] * s_content +
                weights["behavior"] * s_behavior +
                weights["rule"] * s_rule
            )

            breakdown = {
                "svd": round(s_svd, 4),
                "ncf": round(s_ncf, 4),
                "content": round(s_content, 4),
                "behavior": round(s_behavior, 4),
                "rule": round(s_rule, 4),
            }

            results.append((pid, float(final), breakdown))

        # Sort by score
        results.sort(key=lambda x: x[1], reverse=True)

        logger.info(
            "Fusion: %d candidates → %d after filtering (cold_start=%s, weights=%s)",
            len(all_pids), len(results), is_cold_start,
            {k: round(v, 2) for k, v in weights.items()},
        )

        return results

    def mmr_rerank(
        self,
        fused_results: List[Tuple[int, float, Dict[str, float]]],
        similarity_fn,
        top_n: int = 10,
    ) -> List[Tuple[int, float, Dict[str, float]]]:
        """
        Maximal Marginal Relevance reranking for diversity.
        similarity_fn(pid_a, pid_b) → float [0, 1]
        """
        if len(fused_results) <= top_n:
            return fused_results

        selected = []
        remaining = list(fused_results)
        lam = self.mmr_lambda

        while len(selected) < top_n and remaining:
            best_idx = -1
            best_mmr = -float("inf")

            for i, (pid, score, breakdown) in enumerate(remaining):
                if not selected:
                    mmr = score
                else:
                    max_sim = max(
                        similarity_fn(pid, sel_pid)
                        for sel_pid, _, _ in selected
                    )
                    mmr = lam * score - (1 - lam) * max_sim

                if mmr > best_mmr:
                    best_mmr = mmr
                    best_idx = i

            if best_idx >= 0:
                selected.append(remaining.pop(best_idx))

        return selected
