"""
Auto-retraining scheduler using APScheduler.

Runs train_all() every RETRAIN_INTERVAL_HOURS hours,
but only if at least MIN_BEHAVIORS_TO_RETRAIN new behavior
events have been logged since the last successful retrain.
"""
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from config import RETRAIN_INTERVAL_HOURS, MIN_BEHAVIORS_TO_RETRAIN

logger = logging.getLogger(__name__)

# ── Shared state (read by /train/schedule-status endpoint) ──────
scheduler_state: Dict[str, Any] = {
    "last_trained_at": None,
    "next_run_time": None,
    "skip_reason": None,
    "total_runs": 0,
    "total_skips": 0,
}

_scheduler: Optional[BackgroundScheduler] = None


def _count_behaviors_since(last_trained_at: datetime | None) -> int:
    """Return number of behavior events logged after last_trained_at."""
    from sqlalchemy import text
    from database import SessionLocal

    try:
        with SessionLocal() as session:
            if last_trained_at:
                result = session.execute(
                    text("SELECT COUNT(*) FROM userbehavior WHERE created_at > :ts"),
                    {"ts": last_trained_at},
                )
            else:
                result = session.execute(text("SELECT COUNT(*) FROM userbehavior"))
            row = result.fetchone()
            return int(row[0]) if row else 0
    except Exception as exc:
        logger.warning("Could not count behaviors: %s", exc)
        return 0


def _run_scheduled_training(registry) -> None:
    """Job executed by APScheduler on every interval tick."""
    logger.info("⏰ Scheduled retrain check triggered.")

    last_trained_at: Optional[datetime] = None
    raw = scheduler_state.get("last_trained_at")
    if isinstance(raw, str):
        last_trained_at = datetime.fromisoformat(raw)

    new_behaviors = _count_behaviors_since(last_trained_at)
    logger.info("  New behavior events since last train: %d (min required: %d)",
                new_behaviors, MIN_BEHAVIORS_TO_RETRAIN)

    if new_behaviors < MIN_BEHAVIORS_TO_RETRAIN:
        reason = (
            f"Only {new_behaviors} new behaviors "
            f"(need >= {MIN_BEHAVIORS_TO_RETRAIN}). Skipping."
        )
        logger.info("  ⏭️  %s", reason)
        scheduler_state["skip_reason"] = reason
        scheduler_state["total_skips"] += 1
        _refresh_next_run()
        return

    logger.info("  🤖 Starting background model retraining…")
    try:
        from training.train_all import train_all
        result = train_all(registry)
        registry.save_all()

        scheduler_state["last_trained_at"] = datetime.now(timezone.utc).isoformat()
        scheduler_state["skip_reason"] = None
        scheduler_state["total_runs"] += 1
        logger.info("  ✅ Retrain complete: %s", result)
    except Exception as exc:
        logger.error("  ❌ Retrain failed: %s", exc)

    _refresh_next_run()


def _refresh_next_run() -> None:
    """Update next_run_time in shared state."""
    if _scheduler:
        jobs = _scheduler.get_jobs()
        if jobs:
            nrt = jobs[0].next_run_time
            scheduler_state["next_run_time"] = nrt.isoformat() if nrt else None


def start_scheduler(registry) -> BackgroundScheduler:
    """Create and start the APScheduler background scheduler."""
    global _scheduler

    _scheduler = BackgroundScheduler(timezone="UTC")
    _scheduler.add_job(
        func=_run_scheduled_training,
        trigger=IntervalTrigger(hours=RETRAIN_INTERVAL_HOURS),
        id="auto_retrain",
        name="Auto Model Retrain",
        replace_existing=True,
        kwargs={"registry": registry},
    )
    _scheduler.start()
    _refresh_next_run()

    logger.info(
        "⏰ Auto-retrain scheduler started — interval=%dh, "
        "min_behaviors=%d, next_run=%s",
        RETRAIN_INTERVAL_HOURS,
        MIN_BEHAVIORS_TO_RETRAIN,
        scheduler_state["next_run_time"],
    )
    return _scheduler


def stop_scheduler() -> None:
    """Gracefully shut down the scheduler."""
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("🛑 Auto-retrain scheduler stopped.")
    _scheduler = None
