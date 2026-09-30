"""
SQLAlchemy ORM Models for PostgreSQL storage in AURA Auditor.
Stores ingested high-stakes document records and signed compliance audit trail reports.
"""

from sqlalchemy import Column, String, Float, Integer, Text, JSON, DateTime
from datetime import datetime, timezone
from app.db.session import Base


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
