"""
Database and Audit Store Unit Tests (Dev 4).
Tests CRUD operations, PII sanitization, and verification audit persistence.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
from app.db.models import AuditLog, VerificationAudit
from app.db.crud import sanitize_payload, log_trace, save_verification_audit, get_audit_by_trace_id
from app.schemas.schemas import AuraState, ReliabilityReport


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_sanitize_payload():
    raw_payload = {
        "user": "alice",
        "api_key": "secret_abc123",
        "nested": {
            "password": "supersecretpassword",
            "normal_field": "hello"
        }
    }
    clean = sanitize_payload(raw_payload)
    assert clean["user"] == "alice"
    assert clean["api_key"] == "[REDACTED]"
    assert clean["nested"]["password"] == "[REDACTED]"
    assert clean["nested"]["normal_field"] == "hello"


def test_log_trace(db_session):
    log_rec = log_trace(
        db=db_session,
        trace_id="trace_test_001",
        event_type="TEST_EVENT",
        payload={"token": "bearer123", "status": "ok"}
    )

    assert log_rec.id is not None
    assert log_rec.trace_id == "trace_test_001"
    assert log_rec.payload["token"] == "[REDACTED]"
    assert log_rec.payload["status"] == "ok"


def test_save_and_retrieve_verification_audit(db_session):
    state = AuraState(
        original_text="The sky is green.",
        trace_id="trace_test_002",
        reliability=ReliabilityReport(score=0.1, bucket="unreliable", contributing_agents=["fact"])
    )

    save_verification_audit(db=db_session, state=state, final_text="[Insufficient evidence: The sky is green.]")

    retrieved = get_audit_by_trace_id(db=db_session, trace_id="trace_test_002")
    assert retrieved["trace_id"] == "trace_test_002"
    assert retrieved["verification_audit"] is not None
    assert retrieved["verification_audit"]["reliability_score"] == 0.1
    assert retrieved["verification_audit"]["reliability_bucket"] == "unreliable"
