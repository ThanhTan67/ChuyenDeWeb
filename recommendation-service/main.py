"""
FastAPI Recommendation Service — Entry Point.
"""
import logging
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import HOST, PORT
from model_registry import registry
from routers import recommend, train
from scheduler import start_scheduler, stop_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load models + start scheduler. Shutdown: cleanup."""
    logger.info("🚀 Starting Recommendation Service...")
    registry.initialize()
    logger.info("✅ Service ready. Models: %s", registry.model_status())
    start_scheduler(registry)
    yield
    stop_scheduler()
    logger.info("🛑 Shutting down Recommendation Service...")


app = FastAPI(
    title="GlowMart AI Recommendation Service",
    description="Hybrid ML recommendation engine: SVD + NCF + Content + Behavior + Rule",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(recommend.router)
app.include_router(train.router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Service health + model status."""
    return {
        "status": "healthy",
        "models": registry.model_status(),
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info",
    )
