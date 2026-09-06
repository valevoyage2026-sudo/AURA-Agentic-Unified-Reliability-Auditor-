# AURA — Agentic Multi-Agent Framework for LLM Fact Verification & Hallucination Mitigation

AURA audits an LLM-generated response (or a user query + response pair), decomposes it into verifiable claims, checks each claim against retrieved evidence and structured knowledge, aggregates the results into a reliability assessment, and — where needed — rewrites unsupported or contradictory content before returning a final, evidence-grounded answer.

AURA does not claim to eliminate hallucination. It detects unsupported or conflicting content, grounds corrections in verified evidence, and is explicit about what it could *not* verify rather than silently passing it through.

---

## Status

Week 1 (foundation layer) — in progress. See [`AURA_Week1_Foundation_Plan.docx`](./AURA_Week1_Foundation_Plan.docx) for the current sprint plan and owner assignments.

---

## How it works (short version)

```
User Query / LLM Response
        │
        ▼
   Orchestrator (LangGraph) ──► Planner (claim decomposition)
        │                              │
        │                              ▼
        │                     RAG + Knowledge Graph retrieval
        │                              │
        │            ┌─────────────────┼─────────────────┐
        │            ▼                 ▼                 ▼
        │      Fact Agent      Citation Agent     Contradiction Agent
        │            └─────────────────┼─────────────────┘
        │                              ▼
        │                   Reliability / Evaluator Agent
        │              ┌───────────────┴───────────────┐
        │           Reliable                       Unreliable / Unresolved
        │              │                                │
        │              ▼                                ▼
        │      Response Generator ◄──────── Self-Repair Agent
        └──────────────┴──── bounded re-check loop ──────┘
                              │
                              ▼
                    Final Output + Audit Trace
```

Full component-level detail, decision rules (loop termination, evaluator conflict resolution, retrieval trust-tiering, citation-check methodology), and known limitations live in [`AURA_ARCHITECTURE_README.md`](./AURA_ARCHITECTURE_README.md) — read that before touching orchestration or evaluator logic.

---

## Documentation map

| Doc | What's in it | Read it when |
|---|---|---|
| [`AURA_ARCHITECTURE_README.md`](./AURA_ARCHITECTURE_README.md) | Full system design: components, data flow, cost/latency budget, tech stack, limitations | You're designing or reviewing a new component |
| [`AGENTS.md`](./AGENTS.md) | Per-agent contract: inputs/outputs, guardrails, failure modes | You're implementing or testing an agent |
| [`SKILLS.md`](./SKILLS.md) | Reusable deterministic/tool functions agents call into | You're deciding whether logic belongs in a skill vs. an agent prompt |
| [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) | Schema rules, LLM-output parsing pattern, determinism requirements, testing checklist | Before opening a PR |
| [`AURA_Week1_Foundation_Plan.docx`](./AURA_Week1_Foundation_Plan.docx) | Current sprint plan, owner assignments, day-by-day tasks | You need to know who owns what this week |

---

## Project structure

```
app/
├── orchestrator/        # LangGraph state machine, Planner (claim decomposition)
├── retrieval/           # Qdrant (vector) + Neo4j (graph) clients, evidence scoring
├── agents/              # Fact, Citation, Contradiction, Evaluator agents
├── refinement/          # Response Generator, Self-Repair Agent
├── api/                 # FastAPI routes (POST /v1/verify, /health)
├── storage/             # PostgreSQL audit schema, trace logging
├── schemas/             # Pydantic models — single source of truth for all agent I/O
prompts/                 # Versioned prompt templates (referenced by filename in logs)
data/                    # Sample documents / sample responses for local dev
tests/                   # Unit, contract, and golden-set regression tests
benchmarks/              # Latency / cost baseline scripts
```

---

## Prerequisites

- Python 3.11+
- Docker (for Qdrant, Neo4j, PostgreSQL locally)
- `uv` or `poetry` for dependency management
- An LLM provider API key (cloud) and/or [Ollama](https://ollama.com) installed (local model routing)

---

## Setup

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd aura
uv sync   # or: poetry install

# 2. Start local infrastructure
docker compose up -d   # Qdrant, Neo4j, PostgreSQL

# 3. Copy and fill in environment config
cp .env.example .env
# set LLM API keys, DB connection strings, OLLAMA_HOST if using local routing

# 4. Run database/index setup
python scripts/init_storage.py

# 5. Ingest the sample corpus (dev only)
python scripts/ingest_sample_data.py --input data/sample_documents.json

# 6. Run the service
uvicorn app.api.main:app --reload
```

Verify it's up:

```bash
curl http://localhost:8000/health
```

---

## Quick usage example

```bash
curl -X POST http://localhost:8000/v1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "audit_only",
    "text": "The Eiffel Tower was completed in 1889 and designed by Gustave Eiffel."
  }'
```

Response includes a claim-level reliability breakdown, any refined text, and a `trace_id` for the full audit record.

---

## Running tests

```bash
pytest                         # full suite
pytest tests/unit               # skills + schema-level, no live LLM calls
pytest tests/contract           # per-agent output-contract tests
pytest tests/golden             # labeled regression set — run before any prompt change
pytest tests/loop_safety        # asserts bounded termination on adversarial input
```

See [`CODING_STANDARDS.md §7`](./CODING_STANDARDS.md) for what each test tier must cover before a PR merges.

---

## Configuration reference

| Variable | Purpose | Default |
|---|---|---|
| `MAX_ITERATIONS` | Hard cap on the verify → refine → re-check loop | `2` |
| `MIN_SIMILARITY` | Minimum vector similarity to count as retrieved evidence | `0.75` |
| `EVALUATOR_WEIGHTS` | Fact/Citation/Contradiction weighting in aggregation | `0.5 / 0.2 / 0.3` |
| `RELIABILITY_THRESHOLD_RELIABLE` | Score cutoff for `reliable` bucket | `0.75` |
| `RELIABILITY_THRESHOLD_BORDERLINE` | Score cutoff for `borderline` bucket | `0.5` |
| `LLM_ROUTING_MODE` | `local`, `cloud`, or `hybrid` | `cloud` (Week 1) |

Full rationale for each default is in `AURA_ARCHITECTURE_README.md §3.6` and `§4`.

---

## Contributing

1. Read `AGENTS.md` for the component you're touching before writing code — the contracts there are enforced by tests, not just documentation.
2. Follow the branch naming and shared-file coordination rules in the current Week plan doc.
3. Every PR needs tests per `CODING_STANDARDS.md §9`'s review checklist.
4. Do not change frozen shared schemas (`app/schemas/`) without team sign-off — see the "Week Team Rules" section of the current sprint plan.

---

## Known limitations

Verification is bounded by retrieval corpus coverage, citation-entailment checks carry their own error rate, and per-request cost scales with claim count. Full discussion in `AURA_ARCHITECTURE_README.md §7`.
