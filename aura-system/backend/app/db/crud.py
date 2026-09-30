"""
Database CRUD utilities and audit log persistence for AURA (AGENTS.md §10.2).
"""

import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.db.models import Base, AuditLog, VerificationAudit
from app.schemas.schemas import AuraState

logger = logging.getLogger(__name__)

SENSITIVE_KEYS = {"api_key", "secret", "password", "token", "authorization", "bearer"}


def create_tables(engine):
    """Initializes database schema."""
    Base.metadata.create_all(bind=engine)


def sanitize_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitizes payload dictionary to remove any potential API keys, bearer tokens, or PII.
    """
    if not isinstance(payload, dict):
        return {"data": str(payload)}

    sanitized: Dict[str, Any] = {}
    for k, v in payload.items():
        if any(s in k.lower() for s in SENSITIVE_KEYS):
            sanitized[k] = "[REDACTED]"
        elif isinstance(v, dict):
            sanitized[k] = sanitize_payload(v)
        elif isinstance(v, list):
            sanitized[k] = [
                sanitize_payload(item) if isinstance(item, dict) else item
                for item in v
            ]
        else:
            sanitized[k] = v
    return sanitized


def log_trace(
    db: Session,
    trace_id: str,
    event_type: str,
    payload: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """
    Persists an audit event to PostgreSQL / SQLite database.
    """
    clean_payload = sanitize_payload(payload) if payload else {}
    log_entry = AuditLog(
        trace_id=trace_id,
        event_type=event_type,
        payload=clean_payload
    )
    db.add(log_entry)
    try:
        db.commit()
        db.refresh(log_entry)
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to log trace {trace_id}: {e}")
    return log_entry


def save_verification_audit(
    db: Session,
    state: AuraState,
    final_text: str
) -> VerificationAudit:
    """
    Persists the overall verification audit snapshot.
    """
    score = state.reliability.score if state.reliability else 0.0
    bucket = state.reliability.bucket if state.reliability else "unresolved"

    snapshot = {
        "claims_count": len(state.claims),
        "verifications_count": len(state.verifications),
        "iteration": state.iteration,
        "mode": state.mode,
    }

    audit_rec = VerificationAudit(
        trace_id=state.trace_id,
        original_text=state.original_text,
        reliability_score=score,
        reliability_bucket=bucket,
        claims_count=len(state.claims),
        final_text=final_text,
        state_snapshot=snapshot
    )
    db.add(audit_rec)
    try:
        db.commit()
        db.refresh(audit_rec)
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save verification audit {state.trace_id}: {e}")
    return audit_rec


def get_audit_by_trace_id(db: Session, trace_id: str) -> Dict[str, Any]:
    """
    Retrieves complete trace audit logs and audit record by trace_id.
    """
    logs = db.query(AuditLog).filter(AuditLog.trace_id == trace_id).order_by(AuditLog.id.asc()).all()
    audit_rec = db.query(VerificationAudit).filter(VerificationAudit.trace_id == trace_id).first()

    return {
        "trace_id": trace_id,
        "verification_audit": {
            "reliability_score": audit_rec.reliability_score if audit_rec else None,
            "reliability_bucket": audit_rec.reliability_bucket if audit_rec else None,
            "claims_count": audit_rec.claims_count if audit_rec else 0,
            "final_text": audit_rec.final_text if audit_rec else None,
            "created_at": audit_rec.created_at.isoformat() if audit_rec and audit_rec.created_at else None,
        } if audit_rec else None,
        "events": [
            {
                "event_type": log.event_type,
                "payload": log.payload,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ]
    }
