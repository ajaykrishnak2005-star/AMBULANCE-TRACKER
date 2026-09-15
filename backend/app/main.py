from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import api_router
from app.database.session import engine
from app.database.base import Base
from app.database.seed_data import seed_database
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ambulance_tracker")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Ambulance Tracker backend...")
    # Auto-create tables if running with SQLite or empty DB
    Base.metadata.create_all(bind=engine)
    # Seed initial test data
    try:
        seed_database()
    except Exception as e:
        logger.warning(f"Seed skipped or already present: {e}")
    yield
    logger.info("Shutting down Ambulance Tracker backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Emergency Ambulance Discovery and AI-Assisted Dispatch Platform",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": "AMBULANCE TRACKER API",
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "emergency_disclaimer": "This platform connects emergency callers directly with verified ambulance providers. It does not replace municipal 911/112/108 services.",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
