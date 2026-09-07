# AGENTS.md — AURA Agent Specifications & Security Rules

This document defines every agent in the AURA pipeline (its responsibility, inputs/outputs, guardrails, and failure behavior) as well as non-negotiable security rules enforced across the codebase.

---

## Conventions

- **Input / Output** are given as the shape of data each agent consumes/produces (see `schemas.py`).
- **Guardrails** are hard constraints the agent must never violate.
- **Failure mode** defines what the agent returns when it cannot complete its task — every agent must have a defined failure output, never a raw exception.

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
  - Subjective/opinion claims must be tagged `subjective` and excluded from the verification routing table.
  - Every claim must map back to a character span in the original text, for citation in the final refined output.
- **Failure mode:** if decomposition confidence is low, fall back to treating the entire response as a single `factual-compound` claim rather than dropping content.

---

## 3. RAG / Retrieval Agent

**Role:** Fetches evidence for a claim from Qdrant (semantic) and Neo4j (structured).

- **Input:** claim text, claim type.
- **Output:** `list[Evidence]` with `confidence`, `retrieval_method`, `source_trust_tier`.
- **Guardrails:**
  - Must return an explicit empty list (not a low-confidence hit) when nothing crosses the minimum similarity threshold.
  - Must attach `source_trust_tier` from ingestion-time metadata; never infer trust tier at query time.
  - Graph queries must include `last_verified` on every edge used.
- **Failure mode:** if either store is unreachable, return whatever the other store yields with a `partial_retrieval: true` flag.

---

## 4. Fact Verification Agent

**Role:** Determines whether a claim is supported, contradicted, or unsupported by retrieved evidence.

- **Input:** claim, `list[Evidence]`.
- **Output:** `VerificationResult` (`verdict`, `confidence`, `evidence_refs`, `rationale`).
- **Guardrails:**
  - If `Evidence` list is empty, must return `insufficient_evidence`, never `contradicted`.
  - `rationale` must cite specific `evidence_refs`.
  - Must not use the LLM's parametric/internal knowledge to override retrieved evidence.
- **Failure mode:** malformed/unparseable LLM output → retry once with a stricter instruction, then fall back to `insufficient_evidence` with `rationale: "verification_error"`.

---

## 5. Citation Verification Agent

**Role:** Validates that cited sources exist, are retrievable, and actually support the attached claim.

- **Input:** claim (type `citation`), cited source reference, retrieved passage for that source (if resolvable).
- **Output:** `VerificationResult` with `verdict` in `{supported, weak_attribution, invalid, n/a}`.
- **Guardrails:**
  - A citation to a non-existent or unretrievable source is always `invalid`.
  - "Supported" requires passage-level semantic entailment, not just topical relevance.
- **Failure mode:** transient fetch failure → return `n/a` and flag for retry, not `invalid`.

---

## 6. Contradiction / Logic Agent

**Role:** Detects internal contradictions between claims, and claim-vs-evidence numeric/date/entity conflicts.

- **Input:** full claim set, evidence per claim.
- **Output:** `VerificationResult` per affected claim pair, plus a `contradiction_graph`.
- **Guardrails:**
  - Must operate over the full claim set at once.
  - A contradiction verdict must name both conflicting claim IDs in `rationale`.
- **Failure mode:** default to `n/a` on ambiguous cases rather than false-positive `contradicted`.

---

## 7. Reliability / Evaluator Agent

**Role:** Aggregates all `VerificationResult`s into a single reliability decision per claim.

- **Input:** all `VerificationResult`s for a claim.
- **Output:** `ReliabilityReport` (`score`, `bucket`: `reliable | borderline | unreliable | unresolved`, `contributing_agents`).
- **Guardrails:**
  - Must apply precedence rules in fixed order (invalid → high-confidence contradiction → all-insufficient → weighted score).
  - Must never silently upgrade a `borderline` claim to `reliable`.
- **Failure mode:** incomplete outputs → renormalize weights over present signals.

---

## 8. Response Refinement / Self-Repair Agent

**Role:** Rewrites `unreliable` claims using existing evidence; hedges `insufficient_evidence`/`borderline` claims; leaves `reliable` claims untouched.

- **Input:** original text, claims with verdicts, evidence.
- **Output:** revised text, `list[edits]` (span, original, replacement, reason).
- **Guardrails:**
  - May not introduce any new factual claim not present in retrieved evidence.
  - Must preserve all `reliable` claims verbatim.
  - Log every edit with a reason code.
- **Failure mode:** if safe rewrite is impossible, default to removing claim and inserting uncertainty note.

---

## 9. Response Generator

**Role:** Produces final user-facing text plus a visible reliability summary.

- **Input:** final claim set with verdicts, refined text.
- **Output:** final response, reliability annotations, audit `trace_id`.
- **Guardrails:** must not strip caveats added for `unresolved` or `borderline` claims.
- **Failure mode:** if iteration cap was hit with unresolved items, explicitly state so in output.

---

## 10. Security Rules & Coding Safety Guardrails

*(Cross-referenced from `SECURITY_RULES.md` — Enforced automatically across all agents & code)*

### 🔒 10.1 Zero Hardcoded Credentials or API Keys
- **NEVER** embed API keys, secrets, DB passwords, or bearer tokens in code, test files, or configs.
- All secrets must be loaded via `pydantic-settings` from environment variables (`app/core/config.py` or `.env`).

### 🛡️ 10.2 Audit Log Sanitization & PII Protection
- Never write raw user PII, confidential payload text, or secret tokens to stdout or application logs.
- Audit logs record metadata, `trace_id`, `claim_id`, and verdict rationale — not raw unredacted documents.
- API endpoints must return sanitized, user-safe error messages without stack traces or DB connection strings.

### ⚡ 10.3 Dynamic Code Execution Ban & Input Containment
- **NEVER** use `eval()`, `exec()`, or regex scraping to parse LLM text outputs.
- All LLM outputs must use Pydantic schema validation (`ValidationError` handling with fallback).
- Database queries must use SQLAlchemy ORM or parameterized `psycopg3` queries (no raw SQL string interpolation).
