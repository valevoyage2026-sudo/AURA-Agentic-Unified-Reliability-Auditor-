"""
Self-Repair Agent Unit Tests (Dev 4).
Verifies claim-level rewriting, verbatim preservation of reliable claims, hedging, and single-span edits.
"""

import pytest
from app.agents.self_repair import SelfRepairAgent
from app.schemas.schemas import Claim, Evidence, VerificationResult


def test_reliable_claim_verbatim_preservation():
    agent = SelfRepairAgent()
    claim = Claim(
        id="claim_001",
        text="The Eiffel Tower was completed in 1889.",
        type="factual-atomic",
        char_span=(0, 40)
    )
    v_res = VerificationResult(
        claim_id="claim_001",
        agent="fact",
        verdict="supported",
        confidence=0.95,
        rationale="Supported by historic records"
    )

    replacement, reason, action = agent.rewrite_claim(claim, v_res, [])
    assert replacement == claim.text
    assert action == "preserved"
    assert reason == "VERBATIM_PRESERVED"


def test_contradicted_claim_rewritten_with_evidence():
    agent = SelfRepairAgent()
    claim = Claim(
        id="claim_002",
        text="The Eiffel Tower was built in 1999.",
        type="factual-atomic",
        char_span=(0, 36)
    )
    v_res = VerificationResult(
        claim_id="claim_002",
        agent="fact",
        verdict="contradicted",
        confidence=0.9,
        rationale="Contradicted by historical data"
    )
    ev = Evidence(
        source_id="doc_123",
        text="The Eiffel Tower was completed in 1889.",
        retrieval_method="vector",
        confidence=0.92,
        source_trust_tier=1
    )

    replacement, reason, action = agent.rewrite_claim(claim, v_res, [ev])
    assert "1889" in replacement
    assert action == "rewritten"
    assert reason == "CONTRADICTION_REWRITTEN_WITH_EVIDENCE"


def test_contradicted_claim_removed_without_evidence():
    agent = SelfRepairAgent()
    claim = Claim(
        id="claim_003",
        text="Alien artifacts exist in Paris.",
        type="factual-atomic",
        char_span=(0, 31)
    )
    v_res = VerificationResult(
        claim_id="claim_003",
        agent="fact",
        verdict="contradicted",
        confidence=0.9,
        rationale="No proof"
    )

    replacement, reason, action = agent.rewrite_claim(claim, v_res, [])
    assert "removed" in replacement.lower()
    assert action == "removed"
    assert reason == "UNRELIABLE_CLAIM_REMOVED"


def test_insufficient_evidence_hedged():
    agent = SelfRepairAgent()
    claim = Claim(
        id="claim_004",
        text="Quantum computers will cure all diseases by 2030.",
        type="factual-atomic",
        char_span=(0, 48)
    )
    v_res = VerificationResult(
        claim_id="claim_004",
        agent="fact",
        verdict="insufficient_evidence",
        confidence=0.3,
        rationale="No reliable evidence retrieved"
    )

    replacement, reason, action = agent.rewrite_claim(claim, v_res, [])
    assert "[Insufficient evidence:" in replacement
    assert action == "hedged"


def test_apply_edits_span_replacement():
    agent = SelfRepairAgent()
    original_text = "The Eiffel Tower was built in 1999. Water boils at 100 degrees Celsius."
    claims = [
        Claim(
            id="claim_001",
            text="The Eiffel Tower was built in 1999.",
            type="factual-atomic",
            char_span=(0, 35)
        ),
        Claim(
            id="claim_002",
            text="Water boils at 100 degrees Celsius.",
            type="factual-atomic",
            char_span=(36, 71)
        )
    ]
    verifications = {
        "claim_001_fact": VerificationResult(
            claim_id="claim_001",
            agent="fact",
            verdict="contradicted",
            confidence=0.9,
            rationale="Built in 1889"
        ),
        "claim_002_fact": VerificationResult(
            claim_id="claim_002",
            agent="fact",
            verdict="supported",
            confidence=0.98,
            rationale="Confirmed"
        )
    }

    refined_text, edits = agent.apply_edits(
        original_text=original_text,
        claims=claims,
        verifications=verifications,
        evidence={}
    )

    assert "Water boils at 100 degrees Celsius." in refined_text
    assert len(edits) == 1
    assert edits[0]["claim_id"] == "claim_001"
    assert edits[0]["action"] == "removed"
