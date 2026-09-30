"""
Unit Tests for Dev 1: Planner Agent & Claim Decomposition + LangGraph Task 2 Workflow.
Asserts verbatim span preservation, claim taxonomy classification, determinism, fallback handling,
and Task 2 StateGraph nodes & compilation.
"""

from unittest.mock import patch, MagicMock
try:
    import pytest
except ImportError:
    pytest = None

from app.graph.planner import decompose_claims
from app.schemas.schemas import AuraState, Claim, Evidence, VerificationResult, ReliabilityReport
from app.graph.workflow import plan_node, retrieve_node, verify_node, evaluate_node, app_graph


def test_planner_decomposition():
    """
    Test 1: Normal prose input decomposition into atomic claims.
    """
    text = "The Eiffel Tower was completed in 1889 in Paris, France. It stands 330 meters tall."
    claims = decompose_claims(text)

    assert len(claims) == 2
    assert claims[0].text == "The Eiffel Tower was completed in 1889 in Paris, France."
    assert claims[1].text == "It stands 330 meters tall."
    assert claims[0].type in ["factual-atomic", "factual-compound"]
    assert claims[1].type in ["factual-atomic", "factual-compound"]


def test_planner_char_spans():
    """
    Test 2: Verbatim Character Span Invariant.
    For every claim: text[start:end] == claim.text
    """
    sample_texts = [
        "The Eiffel Tower was completed in 1889 in Paris, France. It stands 330 meters tall.",
        "According to Smith et al. (2021), Quantum computing will solve climate change by 2030.",
        "AURA is the best fact-checking tool ever created.",
        "Line 1 text statement.\nLine 2 another assertion.",
    ]

    for text in sample_texts:
        claims = decompose_claims(text)
        assert len(claims) > 0
        for claim in claims:
            start, end = claim.char_span
            extracted = text[start:end]
            assert extracted == claim.text, f"Span mismatch: text[{start}:{end}] = '{extracted}' != '{claim.text}'"


def test_planner_claim_ids_are_deterministic():
    """
    Test 3: Canonical claim IDs must be identical across multiple calls with identical input.
    """
    text = "The Eiffel Tower was completed in 1889 in Paris, France. It stands 330 meters tall."
    run1 = decompose_claims(text)
    run2 = decompose_claims(text)

    assert len(run1) == len(run2)
    for c1, c2 in zip(run1, run2):
        assert c1.id == c2.id
        assert c1.text == c2.text
        assert c1.char_span == c2.char_span
        assert c1.type == c2.type


def test_planner_subjective_claim():
    """
    Test 4: Heuristic classification of opinion/subjective claims.
    """
    text = "In my opinion, this is the best solution."
    claims = decompose_claims(text)

    assert len(claims) >= 1
    assert any(c.type == "subjective" for c in claims)


def test_planner_citation_claim():
    """
    Test 5: Heuristic classification of citation claims.
    """
    text = "According to the WHO report, vaccination reduces severe disease."
    claims = decompose_claims(text)

    assert len(claims) >= 1
    assert any(c.type == "citation" for c in claims)


def test_planner_unverifiable_claim():
    """
    Test 6: Heuristic classification of unverifiable / speculative claims.
    """
    text = "Quantum computing will solve climate change by 2030."
    claims = decompose_claims(text)

    assert len(claims) >= 1
    assert any(c.type == "unverifiable" for c in claims)


def test_planner_malformed_fallback():
    """
    Test 7: Malformed / ambiguous input fallback mechanism.
    Must return 1 Claim with complete original input and char_span=(0, len(text)).
    """
    # Simulate unparseable input with fallback
    text = "   "
    claims = decompose_claims(text)

    assert len(claims) == 1
    claim = claims[0]
    assert claim.text == text
    assert claim.type == "factual-compound"
    assert claim.char_span == (0, len(text))


def test_empty_input_does_not_crash():
    """
    Test 8: Safe handling of empty string input without crashing.
    """
    text = ""
    claims = decompose_claims(text)

    assert len(claims) == 1
    claim = claims[0]
    assert claim.text == ""
    assert claim.type == "factual-compound"
    assert claim.char_span == (0, 0)
    assert claim.depends_on == []


# ==============================================================================
# Task 2 — LangGraph StateGraph & Node Tests
# ==============================================================================

def test_graph_compilation():
    """
    Task 2 Test 1: Verify the StateGraph compiles successfully.
    """
    assert app_graph is not None


def test_plan_node():
    """
    Task 2 Test 2: Verify plan_node returns decomposed Claim objects from AuraState.
    """
    state = AuraState(original_text="The Eiffel Tower is in Paris.", trace_id="trace-123")
    res = plan_node(state)

    assert "claims" in res
    assert isinstance(res["claims"], list)
    assert len(res["claims"]) > 0
    assert all(isinstance(c, Claim) for c in res["claims"])
    assert "Eiffel Tower" in res["claims"][0].text


def test_retrieve_node():
    """
    Task 2 Test 3: Verify retrieve_node returns evidence dictionary keyed by claim ID.
    """
    claim1 = Claim(id="c1", text="Earth is round.", type="factual-atomic", char_span=(0, 15))
    claim2 = Claim(id="c2", text="Sky is blue.", type="factual-atomic", char_span=(16, 28))
    state = AuraState(original_text="Earth is round. Sky is blue.", claims=[claim1, claim2], trace_id="trace-123")

    mock_evidence = Evidence(
        source_id="src1",
        text="Earth is spherical",
        retrieval_method="vector",
        confidence=0.9,
        source_trust_tier=1
    )

    mock_retriever = MagicMock()
    mock_retriever.retrieve.return_value = {
        "evidence": [mock_evidence],
        "partial_retrieval": False,
        "sources_contacted": ["v1"],
        "entities_resolved": []
    }

    with patch("app.graph.workflow.HybridRetriever", return_value=mock_retriever):
        res = retrieve_node(state)

    assert "evidence" in res
    assert isinstance(res["evidence"], dict)
    assert "c1" in res["evidence"]
    assert "c2" in res["evidence"]
    assert res["evidence"]["c1"] == [mock_evidence]
    assert res["evidence"]["c2"] == [mock_evidence]


def test_verify_node():
    """
    Task 2 Test 4: Verify verify_node routes factual and citation claims correctly
    and skips subjective and unverifiable claims.
    """
    c_fact = Claim(id="c_fact", text="Fact text", type="factual-atomic", char_span=(0, 9))
    c_cite = Claim(id="c_cite", text="According to study", type="citation", char_span=(10, 28))
    c_subj = Claim(id="c_subj", text="I think it is great", type="subjective", char_span=(29, 48))
    c_unver = Claim(id="c_unver", text="Will cure all by 2099", type="unverifiable", char_span=(49, 70))

    state = AuraState(
        original_text="...",
        claims=[c_fact, c_cite, c_subj, c_unver],
        evidence={"c_fact": [], "c_cite": []},
        trace_id="trace-123"
    )

    fact_res = VerificationResult(
        claim_id="c_fact", agent="fact", verdict="insufficient_evidence", confidence=0.0, rationale="no ev"
    )
    cite_res = VerificationResult(
        claim_id="c_cite", agent="citation", verdict="invalid", confidence=0.0, rationale="no ev"
    )

    mock_fact_agent = MagicMock()
    mock_fact_agent.run.return_value = fact_res
    mock_cite_agent = MagicMock()
    mock_cite_agent.run.return_value = cite_res

    with patch("app.graph.workflow.FactVerificationAgent", return_value=mock_fact_agent), \
         patch("app.graph.workflow.CitationVerificationAgent", return_value=mock_cite_agent):
        res = verify_node(state)

    assert "verifications" in res
    verifications = res["verifications"]
    assert "c_fact_fact" in verifications
    assert "c_cite_citation" in verifications
    assert len(verifications) == 2
    assert verifications["c_fact_fact"] == fact_res
    assert verifications["c_cite_citation"] == cite_res

    mock_fact_agent.run.assert_called_once_with(c_fact, [])
    mock_cite_agent.run.assert_called_once_with(c_cite, [])


def test_evaluate_node():
    """
    Task 2 Test 5: Verify evaluate_node converts verifications map to list and invokes EvaluatorAgent.
    """
    v1 = VerificationResult(claim_id="c1", agent="fact", verdict="supported", confidence=0.9, rationale="ok")
    v2 = VerificationResult(claim_id="c2", agent="citation", verdict="supported", confidence=0.8, rationale="ok")

    state = AuraState(
        original_text="...",
        verifications={"c1_fact": v1, "c2_citation": v2},
        trace_id="trace-123"
    )

    mock_report = ReliabilityReport(score=0.85, bucket="reliable", contributing_agents=["fact", "citation"])
    mock_evaluator = MagicMock()
    mock_evaluator.evaluate.return_value = mock_report

    with patch("app.graph.workflow.EvaluatorAgent", return_value=mock_evaluator):
        res = evaluate_node(state)

    assert "reliability" in res
    assert res["reliability"] == mock_report
    mock_evaluator.evaluate.assert_called_once()
    call_args = mock_evaluator.evaluate.call_args[0][0]
    assert len(call_args) == 2
    assert v1 in call_args
    assert v2 in call_args


def test_node_state_purity():
    """
    Task 2 Test 6: Verify node functions return state update dictionaries without mutating input AuraState.
    """
    c1 = Claim(id="c1", text="Test text", type="factual-atomic", char_span=(0, 9))
    e1 = Evidence(source_id="s1", text="t", retrieval_method="vector", confidence=0.5, source_trust_tier=1)
    v1 = VerificationResult(claim_id="c1", agent="fact", verdict="supported", confidence=0.9, rationale="ok")

    state = AuraState(
        original_text="Test text",
        claims=[c1],
        evidence={"c1": [e1]},
        verifications={"c1_fact": v1},
        trace_id="trace-123"
    )

    # Capture initial state values
    orig_text = state.original_text
    orig_claims = list(state.claims)
    orig_evidence = dict(state.evidence)
    orig_verifications = dict(state.verifications)
    orig_trace_id = state.trace_id

    mock_retriever = MagicMock()
    mock_retriever.retrieve.return_value = {"evidence": [e1]}

    with patch("app.graph.workflow.HybridRetriever", return_value=mock_retriever):
        plan_node(state)
        retrieve_node(state)
        verify_node(state)
        evaluate_node(state)

    # Verify input AuraState object attributes remain unmutated
    assert state.original_text == orig_text
    assert state.claims == orig_claims
    assert state.evidence == orig_evidence
    assert state.verifications == orig_verifications
    assert state.trace_id == orig_trace_id
