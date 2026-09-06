# AURA — Hallucination Verification Service

## Week 1 Foundation Plan

*Coordinated 4-developer implementation workflow, organized by dependency order and sequential handoffs.*

---

## 1. Developer Team & Layer Ownership

| Developer | Primary Responsibility | Additional / Cross-Team Responsibility |
|---|---|---|
| Dev 1 | Layer 1: Orchestrator + Planner (LangGraph state machine, claim decomposition) | Iteration-cap enforcement, workflow tests |
| Dev 2 | Layer 1: Knowledge & Retrieval (Qdrant vector search + Neo4j graph) | Evidence confidence scoring, trust-tier metadata |
| Dev 3 | Layer 2: Verification Agents + Evaluator (Fact, Citation, Contradiction, aggregation logic) | Golden-set regression tests, deterministic aggregation |
| Dev 4 | Layer 2: API + Audit + Refinement (FastAPI, Postgres audit store, Response Generator, Self-Repair Agent) | Shared contracts, integration tests, release/demo |

---

## 2. Technical Dependencies & Critical Path

The team follows the dependency tree below. Shared contracts are frozen first; the Orchestrator, Retrieval layer, and Verification agents then develop independently before Dev 4 performs final integration.

- Dev 4 freezes `AuraState` / `Claim` / `Evidence` / `VerificationResult` / `ReliabilityReport` schemas → unblocks Dev 1, Dev 2, and Dev 3.
- Dev 1's Planner output (typed claims) → required before Dev 3's agents can be tested against realistic input.
- Dev 2's Evidence objects → required before Dev 3's Fact/Citation agents can run against real (not mocked) retrieval.
- Dev 1's Orchestrator graph → required before Dev 4 can wire the real pipeline behind the public API.

---

## 3. Critical Early Deliverables

**Required by Day 2:**

- Shared `AuraState` / `Claim` / `Evidence` / `VerificationResult` / `ReliabilityReport` contract (Dev 4) → unblocks Dev 1, Dev 2, Dev 3.
- LangGraph orchestrator skeleton + node stubs (Dev 1) → allows Dev 4 to design the API layer against a known graph shape.
- `VectorRetriever` / `GraphRetriever` interfaces (Dev 2) → allows verification agents to develop against a stable retrieval contract.
- `BaseVerificationAgent` interface + prompt-template scaffolding (Dev 3) → keeps all three verification agents structurally consistent.
- Frozen `sample_responses.json` (LLM outputs to audit) and canonical `claim_id` format (Dev 4) → prevents ID/schema conflicts.

---

## 4. Coordinated Git & Integration Strategy

- **Repository isolation:** each developer owns a defined set of modules (`orchestrator/`, `retrieval/`, `agents/`, `api+storage/`).
- **Shared contract first:** Dev 4 commits schemas/interfaces before Dev 1, Dev 2, and Dev 3 implement against them.
- **Branch naming:** `feature/week1-dev1-orchestrator`, `feature/week1-dev2-retrieval`, `feature/week1-dev3-verification`, `feature/week1-dev4-api-integration`.
- **Shared-file rule:** changes to `schemas.py`, `config.py`, `requirements.txt`, or the core README require team coordination.
- **Integration order:** individually test Dev 1/2/3 modules before Dev 4 performs final end-to-end integration.
- **No drive-by refactoring:** do not rename classes, move directories, or reformat another developer's module.
- Every PR contains a focused change and tests.
- Main receives reviewed/tested PRs only.

---

## 5. Day-by-Day Implementation Flow (Week 1)

### Day 1–2: Foundation & Schema Alignment

**Dev 4 — API / Shared Foundation**
Task: Freeze the shared contract and project skeleton.
- Create `app/orchestrator`, `app/agents`, `app/retrieval`, `app/api`, `app/storage`, `tests`, `data`, `benchmarks`.
- Create Pydantic models: `Claim`, `Evidence`, `VerificationResult`, `ReliabilityReport`, `AuraState`.
- Define `claim_id` as the canonical claim identifier; never expose internal graph-node IDs.
- Define the `POST /v1/verify` request and response format.
- Create `sample_responses.json` with 30–50 representative LLM responses to audit (mixed claim types).
- Create `config.py` for model, retrieval, and iteration-cap settings (`max_iterations` default = 2).
- Commit and announce the Week 1 contract freeze.

**Dev 1 — Orchestrator & Planner**
Task: Build the workflow skeleton and claim decomposition.
- Create `app/orchestrator/graph.py` with LangGraph node stubs: retrieve → verify → evaluate → refine.
- Create `app/orchestrator/planner.py` implementing claim decomposition.
- Define the claim-type taxonomy: `factual-atomic`, `factual-compound`, `citation`, `subjective`, `unverifiable`.
- Implement verbatim span extraction so every claim maps back to the original text.
- Write tests for decomposition on `sample_responses.json`, including ambiguous/malformed input fallback.
- Do not implement retrieval calls or verification-agent logic yet.

**Dev 2 — Knowledge & Retrieval Layer**
Task: Build the retrieval abstractions.
- Create `app/retrieval/vector_store.py` (Qdrant client wrapper).
- Create `app/retrieval/knowledge_graph.py` (Neo4j client wrapper).
- Define the common `Evidence` interface: `confidence`, `retrieval_method`, `source_trust_tier`, `last_verified`.
- Implement a basic ingestion script for the sample document corpus.
- Define `source_trust_tier` metadata at ingestion time (never inferred at query time).
- Write tests distinguishing an empty result (no evidence) from a low-confidence result.
- Do not implement verification-agent logic.

**Dev 3 — Verification Agents (skeleton)**
Task: Build the agent contract without live retrieval.
- Create `app/agents/fact_agent.py`, `citation_agent.py`, `contradiction_agent.py`, `evaluator_agent.py`.
- Define `BaseVerificationAgent` with a fixed `run(claim, evidence) → VerificationResult` signature.
- Draft v1 prompt templates in `prompts/`, versioned and referenced by filename.
- Write schema-validation tests against mocked LLM output, including malformed-output fallback.
- Do not call live retrieval yet — use fixture `Evidence` objects.

### Day 3–4: Core Algorithm Implementation

**Dev 1 — Orchestrator Wiring & Loop Safety**
- Wire the full LangGraph state machine across all nodes.
- Implement routing logic: `reliable` / `borderline` / `unreliable` / `unresolved`.
- Implement the bounded re-check loop (hard-capped by `max_iterations`, enforced as a graph conditional edge).
- Implement the zero-evidence short-circuit: no retrieved evidence routes directly to `unresolved`, skipping verification agents.
- Write a test proving termination within `max_iterations` on an adversarial always-borderline claim.

**Dev 2 — Retrieval Algorithms**
- Implement `semantic_search(query, top_k, min_similarity)` against Qdrant.
- Implement `graph_lookup(entities, relation_type)` against Neo4j, returning `last_verified` per edge.
- Implement `apply_trust_weighting(evidence_list)`.
- Implement a first-pass `resolve_entities(text)` for named-entity linking.
- Benchmark retrieval latency on the sample corpus (baseline for Day 6–7 measurement).
- Write tests for confidence-score correctness and threshold behavior.

**Dev 3 — Verification Logic & Deterministic Aggregation**
- Implement Fact Verification Agent using `check_entailment` against retrieved evidence.
- Implement Citation Verification Agent: `check_citation_exists` + entailment-based `weak_attribution` logic.
- Implement Contradiction Agent: numeric/date conflict detection + logical conflict detection.
- Implement `aggregate_verdicts()` in the Evaluator as pure deterministic code (no LLM calls) following fixed precedence: invalid → high-confidence contradiction → all-insufficient → weighted score.
- Write guardrail tests: empty evidence → `insufficient_evidence` (never `contradicted`); invalid citation → `unreliable` regardless of other signals.

**Dev 4 — Refinement, Audit & API Skeleton**
- Implement Response Generator skeleton, including reliability-annotation output fields.
- Implement Self-Repair Agent: `rewrite_claim()` and `apply_edits()`, scoped to single-claim spans only.
- Implement the PostgreSQL audit schema and `log_trace(trace_id, event, payload)`.
- Stand up `/health` and a temporary mock `/v1/verify` endpoint.
- Keep API work independent while Dev 1/2/3 finish their modules.

### Day 5: Wiring, Integration & Unit Tests

**Dev 1 — Orchestrator Validation**
- Run the complete orchestrator/state-machine test suite.
- Verify iteration-cap enforcement end-to-end using mocked agent responses.
- Verify state transitions are pure (no in-place mutation) and reconstructable from a `trace_id`.
- Merge orchestrator and planner modules with tests.

**Dev 2 — Retrieval Validation**
- Run retrieval unit tests against seeded Qdrant and Neo4j instances.
- Verify trust-tier weighting changes ranking as expected on a controlled fixture set.
- Record baseline retrieval latency (per-query, p50/p95).
- Merge retrieval module and tests.

**Dev 3 — Verification & Evaluator Validation**
- Run all agent contract tests against fixture evidence.
- Validate Evaluator aggregation against a small golden-set (claim, evidence, expected bucket) table.
- Confirm precedence rules hold under conflicting agent verdicts.
- Merge verification agents, Evaluator, and tests.

**Dev 4 — End-to-End Integration**
- Replace the mock endpoint with the real Orchestrator call.
- Wire Response Generator + Self-Repair Agent into the Orchestrator's terminal routing.
- Connect audit logging to every state transition, not just the final result.
- Add API tests: valid response, zero-claims input, zero-evidence claim, max-iterations-hit case.
- Run the full integration suite.

### Day 6–7: Stabilization, Benchmarking & Release

**All Developers**
- Run the full pipeline end-to-end on `sample_responses.json` from a clean environment.
- Test each claim type: `factual-atomic`, `factual-compound`, `citation`, `subjective`, `unverifiable`.
- Verify unresolved/borderline claims surface a visible caveat in the final output (never silently passed through as verified).
- Test audit-store and index persistence across a process restart.
- Run the complete pytest suite.
- Record baseline latency and LLM-call/token count per request for 5-claim and 20-claim sample responses.
- Fix integration defects without changing the frozen shared contracts.
- Update the README and tag the Week 1 release.

---

## 6. Progress Tracking Checklist (Week 1)

### Layer 1: Orchestrator & Planner
- [ ] LangGraph state machine wired end-to-end (Dev 1)
- [ ] Claim decomposition + type taxonomy implemented (Dev 1)
- [ ] Verbatim span mapping verified (Dev 1)
- [ ] Iteration-cap enforcement implemented and tested (Dev 1)
- [ ] Zero-evidence short-circuit implemented (Dev 1)
- [ ] Loop-termination test passing on adversarial input (Dev 1)

### Layer 1: Knowledge & Retrieval
- [ ] Qdrant vector retrieval implemented (Dev 2)
- [ ] Neo4j graph lookup implemented (Dev 2)
- [ ] Evidence confidence + `source_trust_tier` implemented (Dev 2)
- [ ] Empty-result vs. low-confidence distinction tested (Dev 2)
- [ ] Retrieval latency baseline recorded (Dev 2)

### Layer 2: Verification & Evaluation
- [ ] Fact Verification Agent implemented (Dev 3)
- [ ] Citation Verification Agent implemented (Dev 3)
- [ ] Contradiction / Logic Agent implemented (Dev 3)
- [ ] Deterministic `aggregate_verdicts()` implemented, no LLM calls (Dev 3)
- [ ] Guardrail tests passing (empty evidence, invalid citation, contradiction precedence) (Dev 3)
- [ ] Golden-set regression suite passing (Dev 3)

### Layer 2: API, Audit & Refinement
- [ ] Shared schemas frozen (Dev 4)
- [ ] Canonical `claim_id` scheme implemented (Dev 4)
- [ ] PostgreSQL audit logging implemented (Dev 4)
- [ ] FastAPI `/health` operational (Dev 4)
- [ ] `POST /v1/verify` operational (Dev 4)
- [ ] Response Generator + Self-Repair Agent wired into Orchestrator (Dev 4)
- [ ] API validation/error tests passing (Dev 4)
- [ ] End-to-end verify → refine → audit test passing (All)

### Quality & Release
- [ ] No duplicate implementations across developer modules
- [ ] No unresolved merge conflicts
- [ ] Full test suite passes
- [ ] Audit-store and index persistence/restart test passes
- [ ] Latency/cost baseline recorded for 5-claim and 20-claim requests
- [ ] README setup instructions verified by another developer
- [ ] Week 1 demo works from a clean checkout
- [ ] Week 1 release tag created

---

## 7. Week 1 Team Rules

- Do not implement local/cloud hybrid model routing yet; Week 1 uses a single fixed model for all agent calls.
- Do not add caching or batching optimizations before the baseline latency/cost is measured.
- Do not implement human-in-the-loop review queues yet; unresolved/borderline claims are surfaced as caveats only.
- Do not change frozen shared schemas mid-week without team approval.
- At the end of each day, push working code and update task status.

---

## 8. Week 1 Expected System State

| | |
|---|---|
| **Input** | sample LLM responses (`sample_responses.json`) |
| **Index** | Qdrant semantic index + Neo4j knowledge graph + PostgreSQL audit tables |
| **Query** | `POST /v1/verify` |
| **Output** | reliability-annotated response with claim-level verdicts, refined text where applicable, and a full audit trace |
