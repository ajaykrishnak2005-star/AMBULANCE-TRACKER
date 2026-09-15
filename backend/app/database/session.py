import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings

logger = logging.getLogger("ambulance_tracker.database")

def get_engine():
    db_url = settings.DATABASE_URL
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        return create_engine(db_url, connect_args=connect_args)
    try:
        engine = create_engine(db_url, pool_pre_ping=True, pool_size=10, max_overflow=20)
        # Test connection
        with engine.connect() as conn:
            pass
        return engine
    except Exception as e:
        logger.warning(f"Could not connect to configured database ({db_url}). Falling back to local SQLite: {e}")
        return create_engine("sqlite:///./ambulance_tracker.db", connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
