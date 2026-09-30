"""
SQLAlchemy ORM Models for PostgreSQL storage in AURA Auditor.
Stores ingested high-stakes document records, signed compliance audit trail reports,
and audit logs.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, JSON, DateTime
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


class IngestedDocumentDB(Base):
    """Stores ingested document, file, and web link metadata in PostgreSQL."""
    __tablename__ = "ingested_documents"

    doc_id = Column(String(128), primary_key=True, index=True)
    title = Column(String(512), nullable=False)
    domain = Column(String(64), nullable=False, index=True)
    content = Column(Text, nullable=False)
    chunks = Column(JSON, nullable=False)
    source_trust_tier = Column(Integer, default=1)
    metadata_json = Column(JSON, default=dict)
    timestamp = Column(String(128), nullable=False)


class ComplianceAuditReportDB(Base):
    """Stores signed compliance audit certificates and claim trace records in PostgreSQL."""
    __tablename__ = "compliance_audit_reports"

    trace_id = Column(String(128), primary_key=True, index=True)
    document_title = Column(String(512), nullable=False)
    domain = Column(String(64), nullable=False, index=True)
    overall_score = Column(Float, nullable=False)
    bucket = Column(String(32), nullable=False)
    total_claims = Column(Integer, nullable=False)
    reliable_claims_count = Column(Integer, nullable=False)
    borderline_claims_count = Column(Integer, nullable=False)
    unreliable_claims_count = Column(Integer, nullable=False)
    claims_breakdown = Column(JSON, nullable=False)
    audit_hash = Column(String(128), nullable=False, unique=True, index=True)
    timestamp = Column(String(128), nullable=False)
