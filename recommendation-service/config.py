"""
Centralized configuration — reads from .env file.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# ── Database ──────────────────────────────────────────────────────────
DB_HOST = os.getenv("DB_HOST", "shortline.proxy.rlwy.net")
DB_PORT = int(os.getenv("DB_PORT", "23799"))
DB_NAME = os.getenv("DB_NAME", "railway")
DB_USERNAME = os.getenv("DB_USERNAME", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "yljGHNjOBonaFyDrFtwvEuXeSdgvXytg")

DATABASE_URL = (
    f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

# ── SVD Hyperparameters ──────────────────────────────────────────────
SVD_N_FACTORS = int(os.getenv("SVD_N_FACTORS", "50"))
SVD_N_EPOCHS = int(os.getenv("SVD_N_EPOCHS", "20"))
SVD_LR = float(os.getenv("SVD_LR", "0.005"))
SVD_REG = float(os.getenv("SVD_REG", "0.02"))

# ── NCF Hyperparameters ─────────────────────────────────────────────
NCF_EMBED_DIM = int(os.getenv("NCF_EMBED_DIM", "32"))
NCF_HIDDEN_LAYERS = [int(x) for x in os.getenv("NCF_HIDDEN_LAYERS", "64,32,16").split(",")]
NCF_EPOCHS = int(os.getenv("NCF_EPOCHS", "20"))
NCF_LR = float(os.getenv("NCF_LR", "0.001"))
NCF_BATCH_SIZE = int(os.getenv("NCF_BATCH_SIZE", "256"))
NCF_NEG_RATIO = int(os.getenv("NCF_NEG_RATIO", "4"))

# ── Fusion Weights ───────────────────────────────────────────────────
WEIGHT_SVD = float(os.getenv("WEIGHT_SVD", "0.30"))
WEIGHT_NCF = float(os.getenv("WEIGHT_NCF", "0.25"))
WEIGHT_CONTENT = float(os.getenv("WEIGHT_CONTENT", "0.20"))
WEIGHT_BEHAVIOR = float(os.getenv("WEIGHT_BEHAVIOR", "0.15"))
WEIGHT_RULE = float(os.getenv("WEIGHT_RULE", "0.10"))

# ── Diversity ────────────────────────────────────────────────────────
MMR_LAMBDA = float(os.getenv("MMR_LAMBDA", "0.7"))

# ── Behavior Decay ───────────────────────────────────────────────────
BEHAVIOR_DECAY_LAMBDA = float(os.getenv("BEHAVIOR_DECAY_LAMBDA", "0.05"))

# ── Server ───────────────────────────────────────────────────────────
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# ── Paths ────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
SAVED_MODELS_DIR.mkdir(exist_ok=True)

# ── Auto-Retrain Scheduler ──────────────────────────────────────
RETRAIN_INTERVAL_HOURS  = int(os.getenv("RETRAIN_INTERVAL_HOURS",  "24"))
MIN_BEHAVIORS_TO_RETRAIN = int(os.getenv("MIN_BEHAVIORS_TO_RETRAIN", "10"))
