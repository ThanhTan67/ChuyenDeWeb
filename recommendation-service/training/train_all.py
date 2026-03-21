"""
Master training orchestrator — trains all models sequentially.
Can be run standalone or triggered via API.
"""
import logging
import time
import sys
from pathlib import Path

# Add parent directory to path for standalone execution
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import SAVED_MODELS_DIR
from data.data_loader import load_all_interactions, load_products
from models.svd_model import SVDModel
from models.ncf_model import NCFModel
from models.content_based import ContentBasedModel
from config import (
    SVD_N_FACTORS, SVD_N_EPOCHS, SVD_LR, SVD_REG,
    NCF_EMBED_DIM, NCF_HIDDEN_LAYERS, NCF_EPOCHS, NCF_LR, NCF_BATCH_SIZE, NCF_NEG_RATIO,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)


def train_all(registry=None) -> dict:
    """
    Train all ML models:
    1. SVD Matrix Factorization
    2. NCF Neural Collaborative Filtering
    3. Content-Based (TF-IDF)

    Rule-based and Behavior-based are computed live and don't need training.
    """
    results = {}
    start = time.time()

    # ── Load data ────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("STEP 1: Loading interaction data from MySQL...")
    interactions = load_all_interactions()

    logger.info("STEP 2: Loading product data...")
    products = load_products()

    if interactions.empty:
        logger.warning("No interaction data found. Only training Content model.")

    # ── Train SVD ────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("STEP 3: Training SVD Matrix Factorization...")
    if registry:
        svd = registry.svd
    else:
        svd = SVDModel(
            n_factors=SVD_N_FACTORS,
            n_epochs=SVD_N_EPOCHS,
            lr=SVD_LR,
            reg=SVD_REG,
        )
    results["svd"] = svd.train(interactions)
    svd.save(SAVED_MODELS_DIR / "svd_model.pkl")

    # ── Train NCF ────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("STEP 4: Training NCF (NeuMF with PyTorch)...")
    if registry:
        ncf = registry.ncf
    else:
        ncf = NCFModel(
            embed_dim=NCF_EMBED_DIM,
            hidden_layers=NCF_HIDDEN_LAYERS,
            n_epochs=NCF_EPOCHS,
            lr=NCF_LR,
            batch_size=NCF_BATCH_SIZE,
            neg_ratio=NCF_NEG_RATIO,
        )
    results["ncf"] = ncf.train(interactions)
    ncf.save(SAVED_MODELS_DIR / "ncf_model.pkl")

    # ── Train Content-Based ──────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("STEP 5: Training Content-Based (TF-IDF)...")
    if registry:
        content = registry.content
    else:
        content = ContentBasedModel()
    results["content"] = content.train(products)
    content.save(SAVED_MODELS_DIR / "content_model.pkl")

    # ── Summary ──────────────────────────────────────────────────────
    elapsed = time.time() - start
    logger.info("=" * 60)
    logger.info("Training completed in %.1f seconds", elapsed)
    for model_name, status in results.items():
        logger.info("  %s: %s", model_name, status.get("status", "unknown"))

    results["elapsed_seconds"] = round(elapsed, 1)
    return results


if __name__ == "__main__":
    results = train_all()
    print("\n✅ Training results:")
    for k, v in results.items():
        print(f"  {k}: {v}")
