"""
FastAPI Endpoints for Verification and Audit Retrieval (AGENTS.md §9, §10).
"""

import uuid
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.schemas import VerifyRequest, VerifyResponse, AuraState, ReliabilityReport
from app.core.config import settings
from app.db.session import get_db, engine
from app.db.crud import create_tables, log_trace, save_verification_audit, get_audit_by_trace_id
from app.orchestrator.graph import app_graph
from app.agents.self_repair import SelfRepairAgent
from app.agents.response_generator import ResponseGenerator

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize DB tables on endpoint load
try:
    create_tables(engine)
except Exception as e:
    logger.warning(f"Database table initialization warning: {e}")


@router.get("/health", status_code=status.HTTP_200_OK)
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint verifying API and DB connectivity.
    """
    db_status = "connected"
    try:
        db.execute("SELECT 1")
    except Exception:
        db_status = "degraded"

    return {
        "status": "healthy",
        "service": "AURA - Agentic Unified Reliability Auditor",
        "database": db_status,
        "max_iterations": settings.MAX_ITERATIONS
    }


@router.post("/verify", status_code=status.HTTP_200_OK)
def verify_text(
    req: VerifyRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Main verification endpoint.
    Decomposes text, retrieves evidence, verifies claims, evaluates reliability,
    and applies self-repair refinement.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request text cannot be empty."
        )

    trace_id = f"trace_{uuid.uuid4().hex[:12]}"

    # 1. Audit trace start
    log_trace(
        db=db,
        trace_id=trace_id,
        event_type="VERIFICATION_STARTED",
        payload={"mode": req.mode, "text_length": len(req.text)}
    )

    try:
        # 2. Build initial AuraState
        initial_state = AuraState(
            original_text=req.text,
            mode=req.mode,
            trace_id=trace_id,
            max_iterations=settings.MAX_ITERATIONS
        )

        # 3. Execute Orchestrator LangGraph state machine
        raw_output = app_graph.invoke(initial_state.model_dump())

        # Parse output into AuraState
        if isinstance(raw_output, dict):
            final_state = AuraState(**raw_output)
        else:
            final_state = raw_output

        # Audit pipeline state transition
        log_trace(
            db=db,
            trace_id=trace_id,
            event_type="PIPELINE_EXECUTED",
            payload={
                "claims_extracted": len(final_state.claims),
                "verifications_count": len(final_state.verifications),
                "reliability_bucket": final_state.reliability.bucket if final_state.reliability else "unresolved"
            }
        )

        # 4. Apply Self-Repair Agent for span-based refinement
        repair_agent = SelfRepairAgent()
        refined_text, edits = repair_agent.apply_edits(
            original_text=final_state.original_text,
            claims=final_state.claims,
            verifications=final_state.verifications,
            evidence=final_state.evidence
        )

        # 5. Generate Response with annotations & reliability summary
        response_gen = ResponseGenerator()
        response_payload = response_gen.generate_response(
            state=final_state,
            refined_text=refined_text,
            edits=edits
        )

        # 6. Audit complete
        save_verification_audit(db=db, state=final_state, final_text=refined_text)
        log_trace(
            db=db,
            trace_id=trace_id,
            event_type="VERIFICATION_COMPLETED",
            payload={
                "reliability_score": response_payload.get("reliability_score"),
                "reliability_bucket": response_payload.get("reliability_bucket"),
                "edits_count": len(edits)
            }
        )

        return response_payload

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during verification trace {trace_id}: {e}", exc_info=True)
        log_trace(
            db=db,
            trace_id=trace_id,
            event_type="VERIFICATION_FAILED",
            payload={"error_type": type(e).__name__}
        )
        # Sanitized error response (AGENTS.md §10.2)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the verification request."
        )


@router.get("/audit/{trace_id}", status_code=status.HTTP_200_OK)
def get_trace_audit(
    trace_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retrieves execution audit logs for a specified trace_id.
    """
    audit_data = get_audit_by_trace_id(db=db, trace_id=trace_id)
    if not audit_data.get("events") and not audit_data.get("verification_audit"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audit log for trace_id '{trace_id}' not found."
        )
    return audit_data
