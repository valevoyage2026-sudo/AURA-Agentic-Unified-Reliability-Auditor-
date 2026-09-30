"""
SQLAlchemy ORM Models for AURA Audit Store.
"""

from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from app.db.session import Base


class AuditLog(Base):
    """
    Detailed audit log for pipeline state transitions and agent events.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trace_id = Column(String(128), index=True, nullable=False)
    event_type = Column(String(64), nullable=False)
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class VerificationAudit(Base):
    """
    Summary table of completed verification requests and final state.
    """
    __tablename__ = "verification_audits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trace_id = Column(String(128), unique=True, index=True, nullable=False)
    original_text = Column(Text, nullable=False)
    reliability_score = Column(Float, nullable=False, default=0.0)
    reliability_bucket = Column(String(32), nullable=False, default="unresolved")
    claims_count = Column(Integer, nullable=False, default=0)
    final_text = Column(Text, nullable=True)
    state_snapshot = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
