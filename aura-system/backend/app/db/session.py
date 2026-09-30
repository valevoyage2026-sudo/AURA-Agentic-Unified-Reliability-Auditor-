"""
PostgreSQL Database Session and Engine setup for AURA Auditor.
"""

import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=False
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as err:
    logger.warning(f"Could not connect to PostgreSQL engine at {settings.DATABASE_URL}: {err}")
    engine = None
    SessionLocal = None


def get_db():
    """Dependency helper for database session."""
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes PostgreSQL tables if database connection is available."""
    if engine is not None:
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("PostgreSQL tables initialized successfully.")
        except Exception as err:
            logger.warning(f"PostgreSQL table creation skipped/failed: {err}")
