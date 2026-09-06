# CODING_STANDARDS.md — AURA

Practical standards for building AURA, scoped to the actual risk points of this system: multi-agent orchestration, structured LLM output, evidence-bound verification, and auditability. General style rules are kept short; more space goes to the rules that are specific to why this architecture fails if skipped.

---

## 1. Language & Tooling

- **Python 3.11+**, `FastAPI` for the API layer, `LangGraph`/`LangChain` for orchestration.
- **Formatting:** `ruff format` (replaces black+isort). `ruff check` as linter. No unformatted merges — run in pre-commit, not just CI.
- **Type checking:** `mypy --strict` on `agents/`, `skills/`, and `schemas/`. Prompt-template modules and notebooks are exempt.
- **Dependency management:** `uv` or `poetry` with a locked file committed. Pin LLM SDK versions explicitly — silent SDK upgrades that change default sampling/response parsing are a common source of hard-to-diagnose regressions in agent pipelines.

---

## 2. Schemas Are the Source of Truth

Every agent input/output defined in `AGENTS.md` must exist as a Pydantic model in `schemas/`, and agents must validate against it at both ends (not just on the way out).

```python
# Good
result = FactVerificationAgent.run(claim, evidence)
assert isinstance(result, VerificationResult)  # enforced by return type + runtime validation

# Bad — passing dicts between agents and hoping the shape matches
result = fact_agent_fn(claim.dict(), [e.dict() for e in evidence])
```

- Never widen a schema field to `Any` or `dict` to "make an LLM response fit." If the LLM's output doesn't match the schema, that's a parsing failure to handle explicitly (see §4), not a reason to loosen the contract.
- Schema changes require updating the corresponding section of `AGENTS.md`/`SKILLS.md` in the same PR — the docs and the code must not drift.

---

## 3. Agent Implementation Rules

- **One agent = one file/module**, matching the sections in `AGENTS.md`. Do not merge agent logic (e.g., don't fold Citation checks into the Fact Agent for convenience) — the separation is load-bearing for the Evaluator's per-signal weighting.
- **No agent calls another agent directly.** All inter-agent communication goes through the Orchestrator's state object. This keeps the dependency graph explicit and testable, and prevents hidden coupling (e.g., Fact Agent silently depending on Contradiction Agent's internal format).
- **Skills vs. agents:** if a piece of logic doesn't require model judgment, it's a skill (see `SKILLS.md`), implemented as a pure function or a thin deterministic wrapper, and unit-tested without mocking an LLM. Only put LLM calls where model judgment is actually required.
- **Prompts live in versioned files**, not inline strings scattered through agent code — `prompts/fact_agent_v3.txt`, referenced by version in logs, so a reliability regression can be traced to a prompt change.

---

## 4. Handling LLM Output (this is where most agent-system bugs actually live)

- **Always parse structured output through a schema validator with a retry-then-fallback path**, matching the failure modes defined per-agent in `AGENTS.md`:

```python
def run_fact_agent(claim: Claim, evidence: list[Evidence]) -> VerificationResult:
    raw = llm_call(FACT_AGENT_PROMPT, claim=claim, evidence=evidence)
    try:
        return VerificationResult.model_validate_json(raw)
    except ValidationError:
        raw_retry = llm_call(FACT_AGENT_PROMPT_STRICT, claim=claim, evidence=evidence)
        try:
            return VerificationResult.model_validate_json(raw_retry)
        except ValidationError:
            log.warning("fact_agent_parse_failure", claim_id=claim.id)
            return VerificationResult(
                claim_id=claim.id, agent="fact",
                verdict="insufficient_evidence", confidence=0.0,
                evidence_refs=[], rationale="verification_error",
            )
```

- **Never `eval()` or regex-scrape free text to recover a verdict.** Use function-calling / structured-output modes where the provider supports them; treat anything else as a parse failure with the fallback above.
- **Log the raw LLM output alongside the parsed result** for every verification call — when the Evaluator's aggregation produces a surprising outcome, you need to see what the underlying agent actually said, not just its final verdict.

---

## 5. Determinism Where It Matters

- `aggregate_verdicts` (the Evaluator's core logic) and all skills in `SKILLS.md`'s "Aggregation Skills" section **must contain zero LLM calls**. This logic is pure Python, fully unit-tested, and must produce identical output given identical input. If you find yourself wanting an LLM to "use judgment" in this function, that judgment belongs in a verification agent upstream, not in aggregation.
- Any place where behavior depends on LLM sampling (temperature > 0), pin `seed` where the provider supports it for reproducibility in tests, and set temperature to 0 for verification agents specifically — these are classification-like tasks, not creative ones, and consistency matters more than diversity here.

---

## 6. Loop & State Safety

- `max_iterations` (see `AGENTS.md §1`) is enforced in the Orchestrator's graph definition itself (a LangGraph conditional edge with a hard count check), not as a convention agents are expected to self-limit.
- Every `AuraState` transition must be a pure function of the previous state (`new_state = transition(old_state, event)`), never in-place mutation, so state history is reconstructable from the audit log for debugging a specific `trace_id`.
- Write a test that explicitly asserts the pipeline terminates within `max_iterations` on an adversarial input (e.g., a claim engineered to always come back `borderline`). This is a required test, not an edge case to skip — it's the failure mode that turns into a runaway cost incident in production.

---

## 7. Testing

- **Unit tests** for every skill in `SKILLS.md`, with no live LLM calls — mock the LLM boundary at the skill's edge (e.g., mock `check_entailment`'s underlying model call, test the skill's pre/post-processing logic around it).
- **Contract tests** per agent asserting output always validates against its schema, including on malformed/adversarial input (empty evidence list, contradictory evidence, non-existent citation).
- **Golden-set regression tests**: maintain a labeled set of (claim, evidence, expected verdict) tuples per domain the system is deployed in. Run this set on every prompt change to catch reliability regressions before they ship — this is not optional given `AURA_ARCHITECTURE_README.md §7`'s explicit note that the Evaluator's weights need domain tuning.
- **Load/cost tests**: assert total LLM call count and token usage for a representative N-claim response stay within the budget defined in the architecture README §4. Treat a budget regression as a failing test, not a follow-up ticket.

---

## 8. Logging & Audit

- Every agent call logs: `trace_id`, `claim_id`, agent name, prompt version, raw output, parsed result, latency, token count. This is not optional instrumentation — it's what `Memory / Audit Storage` in the architecture depends on.
- Never log full evidence document text at INFO level in application logs (cost/noise) — log `evidence_refs` (IDs) and rely on the audit DB for full payloads.
- PII/sensitive content passed through the pipeline (if the deployment audits user-submitted text) must be redacted in logs per your deployment's data-handling policy — this is a per-deployment config, not hardcoded, since trust/compliance requirements vary by where AURA is deployed.

---

## 9. Code Review Checklist (apply per PR touching agents/skills)

- [ ] Does the change match the contract in `AGENTS.md`/`SKILLS.md`? If not, are the docs updated in the same PR?
- [ ] Is new LLM-output parsing wrapped in the retry-then-fallback pattern (§4)?
- [ ] Does any new aggregation/decision logic avoid LLM calls (§5)?
- [ ] Are new loops/recursive calls bounded, with a test proving termination (§6)?
- [ ] Are new skills unit-testable without a live LLM call?
- [ ] Does the change affect token/call cost per request? If so, is the load test (§7) still passing?
