# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Enterprise Compliance Officers, Legal Counsel, and Regulatory Auditors**: Operating in high-stakes environments (finance, healthcare, legal filings) auditing complex reports, contracts, and AI syntheses for regulatory compliance, source validity, and hallucination risk.
- **AI Systems Engineers & QA Teams**: Benchmarking, validating, and debugging autonomous multi-agent pipelines and LLM deployments prior to production release.

## Product Purpose
AURA (Agentic Unified Reliability Auditor) exists to automate high-stakes compliance and hallucination auditing. Instead of aiming for sub-second consumer chatbot interactions, AURA audits long-form, high-risk documents and AI outputs by breaking them down into atomic verifiable claims, corroborating against multi-source knowledge (semantic vector search and structured knowledge graphs), identifying contradictions and missing citations, and producing verifiable, auditable compliance reports with bounded self-repair. Success means zero undetected regulatory hallucinations or unsubstantiated factual statements passing into high-stakes deliverables.

## Positioning
Unlike generic chatbot evaluators or simple RAG wrappers, AURA is a deterministic multi-agent compliance auditor that treats evidence as binding. It decouples claim decomposition from verification, combines vector retrieval (Qdrant) and structured knowledge graph retrieval, enforces strict precedence rules over evidence verdicts (invalid citations and contradictions override loose semantic similarity), and provides tamper-evident audit trails with bounded autonomous repair.

## Operating Context
- Operational modes:
  1. **Automated Compliance Auditor Mode**: Batch ingestion and auditing of regulatory reports, contracts, or LLM-generated filings, producing deterministic compliance scores and flagged audit trails.
  2. **Interactive Audit Workbench Mode**: Real-time operator workspace where compliance officers or AI engineers inspect live agent telemetry, step through claim-by-claim verification graphs, evaluate source trust tiers, and manually review or override self-repair suggestions.
- Environment & Tools: Desktop web browser connected to the AURA backend, backed by LangGraph orchestration, PostgreSQL audit memory, Qdrant vector store, and structured knowledge graph.

## Capabilities and Constraints
- Capabilities:
  - Atomic claim decomposition with verbatim source span mapping and claim typing (`factual-atomic`, `factual-compound`, `citation`, `subjective`, `unverifiable`).
  - Dual-store retrieval: semantic vector matching (Qdrant) and structured graph relationship queries.

  - Tri-agent verification: Fact Verification Agent (evidence-bound), Citation Verification Agent (entailment and source validation), and Logic/Contradiction Agent (relational cross-claim consistency).
  - Deterministic evaluation: mathematical aggregation of agent verdicts without LLM subjective drift.
  - Bounded self-repair loop: automatic targeted re-retrieval and rewriting of unreliable claims bounded by strict iteration caps (`MAX_ITERATIONS = 2`).
  - Comprehensive telemetry: latency, token counts, model attribution, and agent state streaming.
- Constraints:
  - Web platform (React + Vite + TypeScript frontend, FastAPI backend).
  - Strictly bound to retrieved evidence: agents cannot hallucinate or use internal parametric knowledge to override missing evidence.
  - No dynamic code execution (`eval`/`exec`) and zero hardcoded credentials.
  - High visual density and technical mission-control aesthetics as established in `DESIGN.md`.

## Brand Commitments
- Name: AURA (Agentic Unified Reliability Auditor).
- Personality & Atmosphere: Mission-control intelligence system, live neural network, forensic auditor, mysterious and technical (avoiding conventional generic purple-gradient SaaS aesthetics).
- Visual Reference: Bound to `@reference/aura-dashboard-reference.png` and `DESIGN.md` guidelines (three-region desktop layout, glowing nodes, electric blue/cyan/violet palette, monospace telemetry).

## Evidence on Hand
- Full architectural specifications and system layer diagrams in `Architecture.md` and `Readme.md`.
- Formal agent contracts, guardrails, and failure modes in `AGENTS.md`.
- Canonical design system and visual language in `DESIGN.md` with visual reference in `aura-system/reference/aura-dashboard-reference.png`.
- Existing web frontend codebase in `aura-system/frontend` (React 18, Vite, TypeScript, Tailwind CSS, Lucide icons).

## Product Principles
- **Evidence Over Belief**: An unverified claim is marked insufficient; absence of evidence is never treated as factual contradiction, and model parametric knowledge never overrides retrieved proof.
- **Traceability at Every Hop**: Every claim must map back to an exact character span in the source text, every verdict must cite explicit evidence references, and all transitions are persisted to the audit trail.
- **Deterministic Precedence**: Reliability scoring follows strict programmatic rules rather than probabilistic vibes: citation invalidity and direct contradictions strictly take precedence over weighted confidence.
- **Bounded Autonomous Repair**: Self-repair is targeted, rewrites only unreliable claims using retrieved evidence without modifying verified claims, and strictly terminates within the iteration cap.
- **Dual-Audience Precision**: The interface effortlessly shifts between high-throughput compliance audit review for analysts and deep telemetry/graph introspection for AI systems engineers.

## Accessibility & Inclusion
- High contrast technical typography (Inter/Space Grotesk with JetBrains Mono for telemetry) against deep dark backgrounds.
- WCAG AA compliant contrast ratios for status indicators and data labels.
- Keyboard accessible navigation across workbench tabs and inspector drawers.
