# Developer 4 (Dev 4) — Week 1 Day 1 Implementation Plan & Tracking

**Developer Role:** Layer 2 — API, Audit, Shared Contracts & Refinement  
**Scope:** Shared Foundation, Schema Contracts Freeze, Environment Config, Audit Log Setup & API Skeleton  
**Date:** Week 1, Day 1  

---

## 📋 Overview & Objectives

Dev 4 is responsible for establishing the core foundation that unblocks Dev 1 (Orchestrator/Planner), Dev 2 (Knowledge/RAG Retrieval), and Dev 3 (Verification Agents/Evaluator). On Day 1, Dev 4's primary mandate is to freeze shared contracts, configure environment/app settings, seed test benchmark datasets, and set up FastAPI & PostgreSQL audit storage.

---

## 🎯 Task Breakdown & Status

| Task ID | Task Description | Scope / Files | Status |
|---|---|---|---|
| **DEV4-101** | **Project Skeleton & Directory Alignment** | Create/align `app/schemas/`, `app/api/`, `app/storage/`, `data/`, `benchmarks/` | `[x] Completed` |
| **DEV4-102** | **Freeze Shared Pydantic Schemas & State Contract** | Define `Claim`, `Evidence`, `VerificationResult`, `ReliabilityReport`, `AuraState` | `[x] Completed` |
| **DEV4-103** | **Canonical ID Specification** | Define `claim_id` format (`claim_{sha256[:12]}`) & `trace_id` generation | `[x] Completed` |
| **DEV4-104** | **System Configuration (`config.py`)** | Create settings for models, vector DB, KG, Postgres, & iteration cap (`max_iterations=2`) | `[x] Completed` |
| **DEV4-105** | **Benchmark & Sample Response Dataset** | Create `data/sample_responses.json` with 30-50 audit test cases | `[x] Completed` |
| **DEV4-106** | **FastAPI Skeleton & Endpoint Contracts** | Create `/health` & `POST /v1/verify` request/response stubs | `[x] Completed` |
| **DEV4-107** | **PostgreSQL Audit Log Schema & Tracker** | Setup `audit_logs` table schema & `log_trace` persistence skill stub | `[x] Completed` |

---

## 🔍 Task Details & Execution Record

### Task DEV4-101: Project Skeleton & Directory Alignment
- **Status:** `[x] Completed`
- **Output:** Aligned backend package structure in `aura-system/backend/app/` with dedicated modules for `schemas`, `api`, `core`, `db`, `agents`, `graph`, `retrieval`, and test datasets in `data/`.

### Task DEV4-102 & DEV4-103: Shared Schemas & State Contract Freeze
- **Status:** `[x] Completed`
- **Contract Specification:**
  - `Claim`: `id`, `text`, `type` (`factual-atomic`, `factual-compound`, `citation`, `subjective`, `unverifiable`), `char_span` `(start, end)`, `depends_on`.
  - `Evidence`: `source_id`, `text`, `retrieval_method` (`vector`, `graph`), `confidence` (0.0-1.0), `source_trust_tier` (1, 2, 3), `last_verified`.
  - `VerificationResult`: `claim_id`, `agent` (`fact`, `citation`, `contradiction`), `verdict` (`supported`, `contradicted`, `insufficient_evidence`, `invalid`, `weak_attribution`, `n/a`), `confidence`, `evidence_refs`, `rationale`.
  - `ReliabilityReport`: `score`, `bucket` (`reliable`, `borderline`, `unreliable`, `unresolved`), `contributing_agents`.
  - `AuraState`: `mode`, `original_text`, `claims`, `evidence`, `verifications`, `reliability`, `iteration`, `max_iterations`, `trace_id`.

### Task DEV4-104: Central Configuration (`config.py`)
- **Status:** `[x] Completed`
- **Key Parameters:**
  - `MAX_ITERATIONS`: `2` (hard cap enforced by Orchestrator)
  - `DEFAULT_MODEL`: `gemini-1.5-pro` / Ollama hybrid
  - Database URLs: Qdrant, Neo4j, PostgreSQL audit URI

### Task DEV4-105: Benchmark Test Dataset (`sample_responses.json`)
- **Status:** `[x] Completed`
- **Dataset Contents:** Seeded 35 audit cases covering factual atomic statements, multi-hop claims, citations (valid, broken, weak attribution), and subjective opinions to test verification routing.

### Task DEV4-106: FastAPI Endpoint Contracts
- **Status:** `[x] Completed`
- **Endpoints Defined:**
  - `GET /health` -> `{"status": "ok", "version": "0.1.0"}`
  - `POST /v1/verify` -> Accepts `{ "text": "...", "mode": "audit_only" | "generate_and_audit" }`, returns `AuraState` output payload.

### Task DEV4-107: PostgreSQL Audit Schema
- **Status:** `[x] Completed`
- **Audit Table (`audit_traces`):** `trace_id`, `timestamp`, `event_type`, `state_snapshot`, `execution_time_ms`.

---

## 📌 Deliverables & Handoff Checklist (End of Day 1)

- [x] Shared Pydantic models validated & unblocking Dev 1, 2, and 3.
- [x] Canonical `claim_id` specification published.
- [x] `config.py` committed with default `max_iterations = 2`.
- [x] `sample_responses.json` committed to `data/`.
- [x] FastAPI `/health` and `/v1/verify` stubs online.
- [x] Dev 4 Day 1 README documentation created in `doc/DEV4_README.md`.
