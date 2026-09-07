---
name: aura
description: Directives, principles, and reference triggers for implementing, modifying, reviewing, testing, and creating AURA skills.
---

# AURA Skills Guidance & Principles

In AURA, a **skill** is defined as:

> *"A reusable capability with a clear contract, responsibility, and boundary."*

AURA contains both:
- **Deterministic skills** (e.g., `aggregate_verdicts`, `apply_edits`, `renormalize_weights`, `detect_numeric_date_conflict`).
- **LLM-dependent skills** (e.g., `check_entailment`, `detect_logical_conflict`, `rewrite_claim`).

---

## Core Skill Principles

1. **Reusable Capabilities**: Implement AURA capabilities as reusable, independently testable skills.
2. **Logic Placement**: Keep deterministic and reusable logic in skills rather than duplicating it inside agent prompts.
3. **Orchestration vs. Infrastructure**: Agents handle model judgment and orchestration; reusable infrastructure belongs in skills.
4. **Strict Boundary Separation**: Maintain clear boundaries between:
   - Retrieval (`semantic_search`, `graph_lookup`)
   - Entity Resolution (`resolve_entities`)
   - Verification (`check_entailment`, `check_citation_exists`, `detect_numeric_date_conflict`, `detect_logical_conflict`)
   - Aggregation (`aggregate_verdicts`, `renormalize_weights`)
   - Repair (`rewrite_claim`, `apply_edits`)
   - Infrastructure / Cross-Cutting (`log_trace`, `route_model`, `batch_claims`, `cache_lookup`, `cache_store`)
5. **Contract Preservation**: Preserve existing skill input/output signatures and data shapes.
6. **Guarantee Semantics**: Never silently alter a skill's guarantees or error semantics.
7. **Testing Deterministic Skills**: Deterministic skills must be covered with standard unit tests (zero live LLM calls).
8. **Testing LLM-Dependent Skills**: LLM-dependent skills must have appropriate fixture-based and evaluation tests.
9. **Consult Catalog First**: Always consult `references/skills-catalog.md` before modifying an existing skill.
10. **Catalog Maintenance**: When creating a new skill, update `references/skills-catalog.md` and maintain the established contract specification style.
11. **No Duplication**: Avoid duplicating capabilities across multiple agents.
12. **Focused Prompts**: Keep agent prompts focused strictly on high-level reasoning and orchestration.

---

## Reference Catalog Lookup Trigger

The detailed AURA skill specifications, function signatures, guarantees, and boundaries are documented in:

`references/skills-catalog.md`

You MUST explicitly consult `references/skills-catalog.md` whenever:
- **Implementing** an existing AURA skill
- **Modifying** an existing AURA skill
- **Reviewing** an AURA skill
- **Testing** an AURA skill
- **Creating** a new AURA skill

---

## Related Architecture & Security References

- **System Architecture & State Schema**: [Architecture.md](file:///home/ace/Documents/AURA-Agentic-Unified-Reliability-Auditor-/Architecture.md) (or `AURA_ARCHITECTURE_README.md`)
- **Security & Data Safety Rules**: [SECURITY_RULES.md](file:///home/ace/Documents/AURA-Agentic-Unified-Reliability-Auditor-/SECURITY_RULES.md)
- **Agent Contracts & Security Guardrails**: [.agents/AGENTS.md](file:///home/ace/Documents/AURA-Agentic-Unified-Reliability-Auditor-/.agents/AGENTS.md)

