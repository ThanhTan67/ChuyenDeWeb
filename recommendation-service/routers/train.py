"""
Training trigger endpoint.
"""
import logging
import asyncio
from typing import Any, Dict
from fastapi import APIRouter, BackgroundTasks

from model_registry import registry
from training.train_all import train_all
from scheduler import scheduler_state
from config import RETRAIN_INTERVAL_HOURS, MIN_BEHAVIORS_TO_RETRAIN

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Training"])

# Track training status
_training_status: Dict[str, Any] = {"is_training": False, "last_result": None}


async def _run_training():
    """Run training in background."""
    _training_status["is_training"] = True
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, train_all, registry)
        _training_status["last_result"] = result
        logger.info("Background training completed: %s", result)
    except Exception as e:
        logger.error("Training failed: %s", e)
        _training_status["last_result"] = {"status": "error", "error": str(e)}
    finally:
        _training_status["is_training"] = False


@router.post("/train")
async def trigger_training(background_tasks: BackgroundTasks):
    """Trigger async model retraining."""
    if _training_status["is_training"]:
        return {"status": "already_training", "message": "Training is already in progress"}

    background_tasks.add_task(_run_training)
    return {"status": "started", "message": "Training started in background"}


@router.get("/train/status")
async def training_status():
    """Check manual training status."""
    return {
        "is_training": _training_status["is_training"],
        "last_result": _training_status["last_result"],
    }


@router.get("/train/schedule-status")
async def schedule_status():
    """Check auto-retrain scheduler status."""
    return {
        "scheduler": {
            "interval_hours": RETRAIN_INTERVAL_HOURS,
            "min_behaviors_to_retrain": MIN_BEHAVIORS_TO_RETRAIN,
            "last_trained_at": scheduler_state.get("last_trained_at"),
            "next_run_time": scheduler_state.get("next_run_time"),
            "skip_reason": scheduler_state.get("skip_reason"),
            "total_auto_runs": scheduler_state.get("total_runs", 0),
            "total_skips": scheduler_state.get("total_skips", 0),
        }
    }
