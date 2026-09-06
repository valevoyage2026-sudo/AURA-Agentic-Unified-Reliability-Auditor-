# AGENTS.md — AURA Agent Specifications

This document defines every agent in the AURA pipeline: its responsibility, inputs/outputs, the guardrails it must enforce, and its failure behavior. Treat this as the contract each agent's implementation must satisfy — unit tests should assert against these contracts directly, not just against "reasonable-looking output."

---

## Conventions used below

- **Input / Output** are given as the shape of data each agent consumes/produces (see `schemas.py` in the actual repo — keep these in sync).
- **Guardrails** are hard constraints the agent must never violate, regardless of what the LLM inside it generates.
- **Failure mode** defines what the agent returns when it cannot complete its task — every agent must have a defined failure output, never a raw exception surfaced to the Orchestrator.

---

## 1. Orchestrator

**Role:** Central controller. Owns `AuraState`, sequences the workflow, enforces the iteration cap, and routes based on the Evaluator's decision.

- **Input:** raw user query or LLM response, `mode` flag.
- **Output:** final `AuraState` including `reliability`, `claims`, and terminal routing decision.
- **Guardrails:**
  - Must enforce `iteration <= max_iterations` before allowing any re-check loop. This is checked in code, not left to agent judgment.
  - Must not allow a claim through to Response Generator with an `unresolved` or `unreliable` verdict unless a caveat has been attached.
  - Must persist state to the audit store (Postgres) at every transition, not only at the end — a crash mid-pipeline should leave a recoverable trace.
- **Failure mode:** on unrecoverable agent failure (e.g., retrieval layer down), Orchestrator marks the affected claims `unresolved: infra_failure` and proceeds rather than blocking the whole response.

---

## 2. Planner / Claim Decomposition Agent

**Role:** Splits the input into atomic, typed claims.

- **Input:** raw response text, `mode`.
- **Output:** `list[Claim]`, each with `id`, `text`, `type` (`factual-atomic | factual-compound | citation | subjective | unverifiable`), and `depends_on` (for compound claims broken into sub-claims).
- **Guardrails:**
  - Must not alter the wording of a claim when extracting it — extraction is verbatim spans, not paraphrase, so downstream evidence matching stays accurate.
  - Subjective/opinion claims must be tagged `subjective` and excluded from the verification routing table (see `AURA_ARCHITECTURE_README.md §3.3`).
  - Every claim must map back to a character span in the original text, for citation in the final refined output.
- **Failure mode:** if decomposition confidence is low (e.g., ambiguous or malformed input), fall back to treating the entire response as a single `factual-compound` claim rather than dropping content.

---

## 3. RAG / Retrieval Agent

**Role:** Fetches evidence for a claim from Qdrant (semantic) and Neo4j (structured).

- **Input:** claim text, claim type.
- **Output:** `list[Evidence]` with `confidence`, `retrieval_method`, `source_trust_tier`.
- **Guardrails:**
  - Must return an explicit empty list (not a low-confidence hit) when nothing crosses the minimum similarity threshold — this distinction drives the "insufficient evidence ≠ contradicted" rule downstream.
  - Must attach `source_trust_tier` from ingestion-time metadata; never infer trust tier at query time.
  - Graph queries must include `last_verified` on every edge used, so stale relationships can be down-weighted.
- **Failure mode:** if either store is unreachable, return whatever the other store yields with a `partial_retrieval: true` flag rather than failing the whole call.

---

## 4. Fact Verification Agent

**Role:** Determines whether a claim is supported, contradicted, or unsupported by retrieved evidence.

- **Input:** claim, `list[Evidence]`.
- **Output:** `VerificationResult` (`verdict`, `confidence`, `evidence_refs`, `rationale`).
- **Guardrails:**
  - If `Evidence` list is empty, must return `insufficient_evidence`, never `contradicted` — the agent has no basis to claim contradiction.
  - `rationale` must cite specific `evidence_refs`; a verdict without a traceable evidence reference is invalid output and should be rejected by the calling code.
  - Must not use the LLM's parametric/internal knowledge to override retrieved evidence — verdict is evidence-bound by design.
- **Failure mode:** malformed/unparseable LLM output → retry once with a stricter output-format instruction, then fall back to `insufficient_evidence` with `rationale: "verification_error"`.

---

## 5. Citation Verification Agent

**Role:** Validates that cited sources exist, are retrievable, and actually support the attached claim.

- **Input:** claim (type `citation`), cited source reference, retrieved passage for that source (if resolvable).
- **Output:** `VerificationResult` with `verdict` in `{supported, weak_attribution, invalid, n/a}`.
- **Guardrails:**
  - A citation to a non-existent or unretrievable source is always `invalid` — no averaging with other signals (see Evaluator rule 1 in the architecture README).
  - "Supported" requires passage-level semantic entailment, not just topical relevance — citing an unrelated section of a real source is `weak_attribution`, not `supported`.
- **Failure mode:** if the source cannot be fetched due to a transient network error (not because it doesn't exist), return `n/a` and flag for retry, not `invalid`.

---

## 6. Contradiction / Logic Agent

**Role:** Detects internal contradictions between claims, and claim-vs-evidence numeric/date/entity conflicts.

- **Input:** full claim set, evidence per claim.
- **Output:** `VerificationResult` per affected claim pair, plus a `contradiction_graph` (which claims conflict with which).
- **Guardrails:**
  - Must operate over the full claim set at once (not claim-by-claim in isolation) — contradictions are inherently relational.
  - A contradiction verdict must name both conflicting claim IDs in `rationale`.
- **Failure mode:** on ambiguous cases (e.g., claims that differ in scope/qualifier, not truly contradictory), default to `n/a` rather than a false-positive `contradicted` — false contradictions are more disruptive to the loop than missed ones.

---

## 7. Reliability / Evaluator Agent

**Role:** Aggregates all `VerificationResult`s into a single reliability decision per claim, following the deterministic rules in `AURA_ARCHITECTURE_README.md §3.6`.

- **Input:** all `VerificationResult`s for a claim.
- **Output:** `ReliabilityReport` (`score`, `bucket`: `reliable | borderline | unreliable | unresolved`, `contributing_agents`).
- **Guardrails:**
  - Must apply the precedence rules in a fixed order (invalid → high-confidence contradiction → all-insufficient → weighted score). This is implemented as code logic, not an LLM judgment call, to keep it deterministic and testable.
  - Must never silently upgrade a `borderline` claim to `reliable` — borderline routes to a single refinement pass, no exceptions.
- **Failure mode:** if agent outputs are incomplete (e.g., Citation Agent timed out), treat the missing signal as absent from the weighted average (renormalize weights) rather than assuming a default verdict for it.

---

## 8. Response Refinement / Self-Repair Agent

**Role:** Rewrites `unreliable` claims using existing evidence; hedges `insufficient_evidence`/`borderline` claims; leaves `reliable` claims untouched.

- **Input:** original text, claims with verdicts, evidence.
- **Output:** revised text, `list[edits]` (span, original, replacement, reason).
- **Guardrails:**
  - May not introduce any new factual claim not already present in the retrieved evidence — enforced by re-running the Fact Agent over the *edited* spans before returning (bounded by `max_iterations`).
  - Must preserve all `reliable` claims verbatim — refinement is targeted, not a full rewrite.
  - Every edit must be logged with a reason code for the audit trail.
- **Failure mode:** if a safe rewrite can't be constructed (e.g., no supporting evidence exists to correct with), default to removing the claim and inserting an explicit uncertainty note rather than fabricating a fix.

---

## 9. Response Generator

**Role:** Produces the final user-facing text plus a visible reliability summary (Section 3.9 of the architecture README — no silent pass-through of `unresolved`/`borderline` content).

- **Input:** final claim set with verdicts, refined text.
- **Output:** final response, reliability annotations (inline or appended), audit `trace_id` reference.
- **Guardrails:** must not strip caveats added for `unresolved` or `borderline` claims, even if the surrounding UI doesn't have a good display slot for them yet — the caveat data must exist in the output payload regardless of rendering.
- **Failure mode:** if the pipeline hit the iteration cap with unresolved items remaining, output must say so explicitly rather than presenting an unqualified final answer.
