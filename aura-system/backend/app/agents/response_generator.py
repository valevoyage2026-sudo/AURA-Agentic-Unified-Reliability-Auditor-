"""
Response Generator Agent (AGENTS.md §9).
Produces final user-facing text plus visible reliability summary and annotations.
Enforces caveat preservation and iteration cap notices.
"""

from typing import Dict, Any, List, Optional
from app.schemas.schemas import AuraState, ReliabilityReport


class ResponseGenerator:
    """
    Response Generator builds the final user-facing response object with full audit trail annotations.
    """

    def generate_response(
        self,
        state: AuraState,
        refined_text: str,
        edits: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generates the final response payload including reliability annotations.
        """
        reliability: Optional[ReliabilityReport] = state.reliability
        bucket = reliability.bucket if reliability else "unresolved"
        score = reliability.score if reliability else 0.0

        # Build claim breakdown
        claim_summary: List[Dict[str, Any]] = []
        unresolved_count = 0
        borderline_count = 0

        for claim in state.claims:
            v_res = None
            for v in state.verifications.values():
                if v.claim_id == claim.id:
                    v_res = v
                    break

            verdict = v_res.verdict if v_res else "unresolved"
            if verdict in ("unresolved", "insufficient_evidence"):
                unresolved_count += 1
            elif verdict in ("weak_attribution", "borderline"):
                borderline_count += 1

            claim_summary.append({
                "claim_id": claim.id,
                "text": claim.text,
                "type": claim.type,
                "verdict": verdict,
                "rationale": v_res.rationale if v_res else "No verification completed",
                "evidence_count": len(state.evidence.get(claim.id, []))
            })

        # Build reliability summary text
        summary_notes: List[str] = [
            f"Overall Reliability Score: {score:.2f} ({bucket.upper()})"
        ]

        if state.iteration >= state.max_iterations and (unresolved_count > 0 or bucket == "unresolved"):
            summary_notes.append(
                f"[CAVEAT] Pipeline reached maximum iteration cap ({state.max_iterations}) with {unresolved_count} unresolved claim(s)."
            )

        if borderline_count > 0 or bucket == "borderline":
            summary_notes.append(
                f"[CAVEAT] Response contains {borderline_count} borderline claim(s) requiring low-confidence caveats."
            )

        reliability_summary = " | ".join(summary_notes)

        return {
            "trace_id": state.trace_id,
            "status": "completed",
            "original_text": state.original_text,
            "final_text": refined_text,
            "reliability_score": score,
            "reliability_bucket": bucket,
            "reliability_summary": reliability_summary,
            "edits_applied": edits,
            "claims_breakdown": claim_summary,
            "iteration": state.iteration,
            "max_iterations_reached": state.iteration >= state.max_iterations
        }
