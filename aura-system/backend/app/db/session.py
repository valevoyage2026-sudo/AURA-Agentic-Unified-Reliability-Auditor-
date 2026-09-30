"""
Database Session Management for AURA Audit Store.
Uses PostgreSQL via SQLAlchemy with SQLite in-memory fallback for local testing environments.
"""

import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()


def get_engine():
    """
    Creates SQLAlchemy engine, falling back to SQLite if PostgreSQL is unavailable.
    """
    db_url = settings.DATABASE_URL
    try:
        if db_url.startswith("postgresql"):
            eng = create_engine(db_url, pool_pre_ping=True)
            with eng.connect():
                pass
            return eng
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}); falling back to SQLite in-memory database.")

    # SQLite fallback with StaticPool so in-memory DB is preserved across sessions
    fallback_url = "sqlite:///:memory:"
    eng = create_engine(
        fallback_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    return eng


engine = get_engine()
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI Dependency for database sessions.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
