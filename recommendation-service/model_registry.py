"""
Global model registry — singleton that holds all loaded/trained models.
"""
import logging
from pathlib import Path
from typing import Optional

from config import (
    SAVED_MODELS_DIR,
    SVD_N_FACTORS, SVD_N_EPOCHS, SVD_LR, SVD_REG,
    NCF_EMBED_DIM, NCF_HIDDEN_LAYERS, NCF_EPOCHS, NCF_LR, NCF_BATCH_SIZE, NCF_NEG_RATIO,
)
from models.svd_model import SVDModel
from models.ncf_model import NCFModel
from models.content_based import ContentBasedModel
from models.rule_based import RuleBasedModel
from models.behavior_model import BehaviorModel
from fusion.score_fusion import ScoreFusion

logger = logging.getLogger(__name__)


class ModelRegistry:
    """Singleton holding all recommendation models."""

    def __init__(self):
        self.svd = SVDModel(
            n_factors=SVD_N_FACTORS,
            n_epochs=SVD_N_EPOCHS,
            lr=SVD_LR,
            reg=SVD_REG,
        )
        self.ncf = NCFModel(
            embed_dim=NCF_EMBED_DIM,
            hidden_layers=NCF_HIDDEN_LAYERS,
            n_epochs=NCF_EPOCHS,
            lr=NCF_LR,
            batch_size=NCF_BATCH_SIZE,
            neg_ratio=NCF_NEG_RATIO,
        )
        self.content = ContentBasedModel()
        self.rule = RuleBasedModel()
        self.behavior = BehaviorModel()
        self.fusion = ScoreFusion()
        self.is_ready = False

    def initialize(self):
        """Load saved models from disk if available."""
        svd_path = SAVED_MODELS_DIR / "svd_model.pkl"
        ncf_path = SAVED_MODELS_DIR / "ncf_model.pkl"
        content_path = SAVED_MODELS_DIR / "content_model.pkl"

        loaded = []
        if svd_path.exists():
            try:
                self.svd.load(svd_path)
                loaded.append("SVD")
            except Exception as e:
                logger.error("Failed to load SVD model: %s", e)

        if ncf_path.exists():
            try:
                self.ncf.load(ncf_path)
                loaded.append("NCF")
            except Exception as e:
                logger.error("Failed to load NCF model: %s", e)

        if content_path.exists():
            try:
                self.content.load(content_path)
                loaded.append("Content")
            except Exception as e:
                logger.error("Failed to load Content model: %s", e)

        # Rule and Behavior don't need loading (computed live)
        loaded.extend(["Rule", "Behavior"])

        self.is_ready = True
        logger.info("Model registry initialized. Loaded: %s", loaded)

    def model_status(self) -> dict:
        """Return status of all models."""
        return {
            "svd": self.svd.trained,
            "ncf": self.ncf.trained,
            "content": self.content.trained,
            "rule": True,      # always available (computed live)
            "behavior": True,  # always available (computed live)
            "is_ready": self.is_ready,
        }

    def save_all(self):
        """Save all trained models to disk."""
        if self.svd.trained:
            self.svd.save(SAVED_MODELS_DIR / "svd_model.pkl")
        if self.ncf.trained:
            self.ncf.save(SAVED_MODELS_DIR / "ncf_model.pkl")
        if self.content.trained:
            self.content.save(SAVED_MODELS_DIR / "content_model.pkl")
        logger.info("All models saved to %s", SAVED_MODELS_DIR)


# Global singleton
registry = ModelRegistry()
