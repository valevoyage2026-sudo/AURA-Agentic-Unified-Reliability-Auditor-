# AURA — Agentic Multi-Agent Framework for LLM Fact Verification & Hallucination Mitigation

**Status:** Design v2 (realistic/production-oriented revision)
**Scope:** This document extends the original AURA design with concrete decision rules, termination conditions, cost controls, and failure-mode handling that a v1 diagram-only spec typically omits.

---

## 1. System Purpose

AURA audits an LLM-generated response (or a user query + response pair), verifies its factual claims against external evidence, scores its reliability, and — when necessary — repairs unsupported or contradictory portions before returning a final answer.

AURA does **not** claim to eliminate hallucination. Its actual guarantee is narrower and more honest:

> Every claim in the final output is either (a) backed by retrievable evidence with a logged citation, (b) explicitly flagged as unverified/low-confidence, or (c) removed/rewritten during self-repair.

This distinction matters — it's what separates a feasible system from an over-promised one.

---

## 2. High-Level Flow

```
User Query / LLM Response
        │
        ▼
   Orchestrator (LangGraph) ──► Planner (claim decomposition)
        │                              │
        │                              ▼
        │                     RAG + Knowledge Graph retrieval
        │                              │
        │                              ▼
        │            ┌─────────────────┼─────────────────┐
        │            ▼                 ▼                 ▼
        │      Fact Agent      Citation Agent     Contradiction Agent
        │            └─────────────────┼─────────────────┘
        │                              ▼
        │                   Reliability / Evaluator Agent
        │                              │
        │              ┌───────────────┴───────────────┐
        │           Reliable                       Unreliable
        │              │                                │
        │              ▼                                ▼
        │      Response Generator ◄──────── Self-Repair Agent
        │              │                                │
        └──────────────┴──── re-check (bounded) ─────────┘
                              │
                              ▼
                        Final Output + Audit Record
```

---

## 3. Components (with the gaps filled in)

### 3.1 Input Layer
Accepts either a raw user query (AURA generates + audits in one pass) or an existing LLM response (AURA audits only). This distinction should be an explicit `mode` flag passed downstream — several other components behave differently depending on it (e.g., the Planner decomposes differently, and the Evaluator's baseline confidence prior differs).

### 3.2 Orchestrator (LangGraph)
Owns workflow state as a typed object, not a loose dict:

```python
class AuraState(TypedDict):
    mode: Literal["generate_and_audit", "audit_only"]
    original_text: str
    claims: list[Claim]
    evidence: dict[str, list[Evidence]]     # claim_id -> evidence
    verifications: dict[str, VerificationResult]
    reliability: ReliabilityReport | None
    iteration: int
    max_iterations: int                     # hard cap, see 3.8
    trace_id: str                           # for audit correlation
```

**Gap filled — loop termination policy.** The original design had a re-check loop with no stop condition. AURA enforces:
- `max_iterations = 2` by default (configurable per deployment, not per request, to prevent cost abuse).
- A claim that fails verification twice is marked `unresolved` and surfaced to the user as a caveat rather than looped on indefinitely.
- If retrieval returns **zero relevant evidence** for a claim (not "contradicting" evidence — *no* evidence), the Orchestrator routes it directly to `unresolved`, skipping the verification agents entirely. This is the single most important termination rule: **absence of evidence is not evidence of falsehood**, and treating it as a verification failure to be "fixed" causes infinite unproductive loops.

### 3.3 Planner / Claim Decomposition
Breaks the response into atomic, independently-checkable claims. Each claim gets a type tag, because downstream agents behave differently per type:

| Claim type | Example | Verification approach |
|---|---|---|
| `factual-atomic` | "The Eiffel Tower was completed in 1889." | Fact Agent + retrieval |
| `factual-compound` | "X caused Y, which led to Z." | Decomposed into sub-claims + Contradiction Agent for causal chain |
| `citation` | "According to [Source], ..." | Citation Agent only |
| `subjective/opinion` | "This is the best approach." | **Excluded from verification** — flagged as opinion, not routed to Fact Agent |
| `unverifiable` | Predictions, private/undisclosed info | Marked `unverifiable`, not treated as unreliable |

**Gap filled:** the original spec implied every claim goes through the same pipeline. Routing subjective and unverifiable claims *out* of the fact-checking path is what keeps false-positive "unreliable" flags down and keeps the loop from thrashing on claims that were never checkable in the first place.

### 3.4 Retrieval Layer (Vector DB + Knowledge Graph)

- **Qdrant (vector):** semantic similarity retrieval over indexed trusted documents. Returns top-k passages with cosine similarity scores.
- **Neo4j (graph):** entity/relationship lookups for structured contradiction checks (dates, numeric facts, named-entity relationships).

**Gap filled — retrieval confidence, not just retrieval presence.** Every evidence item carries a `confidence` score derived from similarity/relationship-match strength, not just a binary hit/miss. The Fact Agent must weigh evidence quality, not just count:

```python
class Evidence(BaseModel):
    source_id: str
    text: str
    retrieval_method: Literal["vector", "graph"]
    confidence: float          # 0.0-1.0
    source_trust_tier: int     # 1 = curated/primary, 2 = secondary, 3 = unvetted
```

`source_trust_tier` is a gap the original design didn't address at all: not all indexed documents deserve equal weight. A curated internal knowledge base entry should outrank a scraped web page even if the scraped page has a higher similarity score. This tiering must be set at ingestion time, not inferred at query time.

**Gap filled — KG maintenance.** Knowledge graphs rot without a refresh pipeline. Realistic approach:
- Nightly batch job re-extracts entities/relations from newly ingested documents (not full re-index — incremental).
- Each graph edge stores a `last_verified` timestamp and `source_doc_id`.
- Edges older than a configurable staleness threshold (e.g., 180 days) are down-weighted in confidence rather than deleted, so verification doesn't silently rely on outdated relationships.
- Do not treat KG construction as a one-time setup step — budget ongoing engineering time for this, comparable to search-index maintenance.

### 3.5 Specialized Verification Agents

**Fact Verification Agent** — checks a claim against retrieved evidence, returns `supported | contradicted | insufficient_evidence` with a confidence score and the specific evidence spans used.

**Citation Verification Agent** — the original spec left "citation relevance" undefined; here's the concrete check it runs:
1. Does the cited source actually exist and is it retrievable? (broken/fabricated citation → immediate `invalid`)
2. Does the cited passage's content semantically entail the claim it's attached to? (embedding similarity between claim and cited passage, thresholded)
3. Is the citation's specificity appropriate (e.g., citing an entire book for a single statistic is flagged as `weak_attribution` even if technically not "wrong")?

**Contradiction / Logic Agent** — checks (a) internal consistency between claims in the same response, (b) claim-vs-evidence numeric/date conflicts, (c) claim-vs-claim chains from compound claims decomposed in 3.3.

**Gap filled — agent output contract.** All three agents return a common structured schema so the Evaluator can aggregate mechanically instead of re-interpreting free text:

```python
class VerificationResult(BaseModel):
    claim_id: str
    agent: Literal["fact", "citation", "contradiction"]
    verdict: Literal["supported", "contradicted", "insufficient_evidence", "invalid", "n/a"]
    confidence: float
    evidence_refs: list[str]
    rationale: str   # short, for audit log — not shown raw to user
```

### 3.6 Reliability / Evaluator Agent

**Gap filled — this was the biggest hole in v1: "the evaluator interprets these signals" is not a decision rule.** Here is a concrete aggregation policy:

1. **Any agent returns `invalid` (e.g., fabricated citation) → claim is `unreliable`, no averaging.** Fabrication is a hard fail, not a signal to blend.
2. **`contradicted` from any agent with confidence > 0.7 → `unreliable`**, regardless of other agents' verdicts. Contradiction is treated as higher-priority than lack of support.
3. If all applicable agents return `insufficient_evidence` → claim is `unresolved` (see 3.2 — routed to caveat, not to refinement loop).
4. Otherwise, compute a weighted score:
   `reliability_score = Σ(agent_confidence × agent_weight × source_trust_tier_factor) / Σ(agent_weight)`
   with default weights: Fact Agent 0.5, Citation Agent 0.2, Contradiction Agent 0.3 (weights are configurable per domain — a legal-document deployment should weight Citation higher).
5. Threshold: score ≥ 0.75 → `reliable`; 0.5–0.75 → `borderline` (sent to refinement once, not looped); < 0.5 → `unreliable`.

This gives the Orchestrator a deterministic branch instead of an ambiguous "the evaluator decides."

### 3.7 Memory / Audit Storage (PostgreSQL)
Stores: full trace per request (`trace_id`), every claim + verdict + evidence reference + agent rationale, iteration count, final decision, and human-override flags (see 3.9). This is what makes the system auditable, not just "explainable" after the fact.

### 3.8 Response Refinement / Self-Repair Agent
Rewrites only claims flagged `unreliable`, using the evidence already retrieved (does not re-query external sources unless retrieval was itself flagged `insufficient_evidence`, in which case it hedges the language instead of inventing a correction). Explicit constraint: the repair agent is **not allowed to introduce new unverified factual claims** — its edits are restricted to (a) removing the unsupported claim, (b) rewriting it to match retrieved evidence, or (c) adding an explicit uncertainty qualifier. This constraint should be enforced structurally (a post-repair pass through the Fact Agent again, bounded by the `max_iterations` cap from 3.2), not just instructed via prompt.

### 3.9 Human-in-the-loop escape hatch (new — not in v1)
Claims marked `unresolved` after hitting `max_iterations`, or any `borderline` result, should be surfaced to the end user as a visible caveat ("this statement could not be independently verified") rather than silently passed through as if fully verified. For high-stakes deployments (medical/legal/financial), route `unresolved` and `borderline` claims to a human review queue instead of auto-publishing. This is the realistic alternative to pretending the pipeline achieves 100% automated coverage.

---

## 4. Cost & Latency Budget (the gap the original diagram ignored entirely)

A naive implementation runs 3 verification agents + 1 evaluator + potentially 1 refinement pass **per claim**. For a 10-claim response, that's 40+ LLM calls before even generating the final answer. This is the primary feasibility risk, not the architecture shape.

Mitigations, in priority order:

1. **Batch claims, don't loop per-claim.** Send all claims for a given agent type in a single batched prompt/call where the model supports structured multi-item output, rather than one call per claim per agent.
2. **Parallelize across agent types, not just within.** Fact/Citation/Contradiction agents run concurrently (the diagram already implies this — make sure the implementation actually does, via `asyncio.gather` or LangGraph parallel branches, not sequential awaits).
3. **Local/cloud routing (Ollama + cloud API hybrid).** Route cheap, high-confidence-retrieval claims (e.g., simple numeric fact checks with a high-similarity vector hit) to a local model. Reserve cloud-API calls for low-confidence or contradiction-flagged claims that need stronger reasoning.
4. **Cache retrieval + verification results** keyed on a normalized claim hash. Repeated or near-duplicate claims across requests (common in FAQ-style or support-bot deployments) shouldn't re-run the full pipeline.
5. **Set a per-request cost/latency ceiling** in the Orchestrator config, and degrade gracefully (skip Citation Agent, fall back to Fact Agent only) rather than failing the request when the ceiling is hit.

Track and log per-request: total LLM calls, total tokens, wall-clock latency, cost. Without this instrumentation you will not know the system is expensive until a bill or a timeout tells you.

---

## 5. Technology Mapping

| Layer | Technology | Notes |
|---|---|---|
| Orchestration | LangGraph | Stateful graph execution, native support for conditional branching + loops with caps |
| LLM/tool integration | LangChain | Prompt templates, retriever interfaces |
| Local inference | Ollama | Routing target for low-stakes/high-confidence claims |
| Vector retrieval | Qdrant | Semantic evidence search |
| Knowledge graph | Neo4j | Structured relationship verification |
| Structured/audit data | PostgreSQL | Trace logs, verdicts, human-override records |
| Backend | FastAPI | Async-first, matches the concurrency needs in Section 4 |
| Frontend | React | Displays reliability scores + caveats, not just final text |
| Deployment | Docker (+ a job scheduler, e.g. cron/Celery, for the KG refresh job in 3.4) | |

---

## 6. Key Design Principles (revised)
- **Modularity** — each agent has one job and a fixed I/O contract (Section 3.5's schema).
- **Evidence grounding with confidence, not binary support** — every verdict carries a numeric confidence and a source trust tier.
- **Bounded iteration** — no unbounded verify/refine loops; `unresolved` is a legitimate terminal state, not a failure to route around.
- **Deterministic aggregation** — the Evaluator follows explicit precedence rules (Section 3.6), not free-form LLM judgment over other agents' outputs.
- **Traceability** — every claim's full verification path is logged with a `trace_id`, queryable independent of the final response.
- **Honest coverage** — the system surfaces what it *couldn't* verify as visibly as what it confirmed or corrected.

---

## 7. Known Limitations (stated explicitly, not glossed over)

- Verification quality is bounded by corpus coverage — AURA cannot verify claims outside its indexed knowledge, and will correctly mark them `unresolved` rather than `false`.
- Citation semantic-entailment checks (3.5) are themselves LLM-based and carry their own error rate; this is a mitigation layer, not a provably correct one.
- Cost scales with claim count; very long or claim-dense responses need the batching/routing strategies in Section 4 to stay practical.
- The Evaluator's weighting scheme (3.6) is a heuristic starting point — it should be tuned against a labeled validation set for your specific domain before production use, not treated as universally correct out of the box.