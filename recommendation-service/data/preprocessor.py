"""
Preprocessing utilities: index mapping, normalization, train/test split.
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple


class IndexMapper:
    """Bidirectional mapping between original IDs and contiguous indices."""

    def __init__(self):
        self.id_to_idx: Dict[int, int] = {}
        self.idx_to_id: Dict[int, int] = {}

    def fit(self, ids):
        unique = sorted(set(int(i) for i in ids))
        self.id_to_idx = {uid: idx for idx, uid in enumerate(unique)}
        self.idx_to_id = {idx: uid for uid, idx in self.id_to_idx.items()}
        return self

    def transform(self, ids) -> np.ndarray:
        return np.array([self.id_to_idx[int(i)] for i in ids])

    def inverse(self, indices) -> List[int]:
        return [self.idx_to_id[int(i)] for i in indices]

    @property
    def size(self) -> int:
        return len(self.id_to_idx)

    def contains(self, original_id: int) -> bool:
        return int(original_id) in self.id_to_idx


def normalize_scores(scores: Dict[int, float]) -> Dict[int, float]:
    """Min-max normalize scores to [0, 1]."""
    if not scores:
        return {}
    values = list(scores.values())
    min_v, max_v = min(values), max(values)
    if max_v == min_v:
        return {k: 0.5 for k in scores}
    return {k: (v - min_v) / (max_v - min_v) for k, v in scores.items()}


def train_test_split(
    df: pd.DataFrame,
    test_ratio: float = 0.2,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Random train/test split keeping at least 1 interaction per user in train."""
    rng = np.random.RandomState(random_state)
    test_indices = []
    grouped = df.groupby("user_id")

    for user_id, group in grouped:
        if len(group) < 2:
            continue  # keep all in train
        n_test = max(1, int(len(group) * test_ratio))
        chosen = rng.choice(group.index, size=n_test, replace=False)
        test_indices.extend(chosen)

    test_set = set(test_indices)
    train = df.loc[~df.index.isin(test_set)].reset_index(drop=True)
    test = df.loc[df.index.isin(test_set)].reset_index(drop=True)
    return train, test
