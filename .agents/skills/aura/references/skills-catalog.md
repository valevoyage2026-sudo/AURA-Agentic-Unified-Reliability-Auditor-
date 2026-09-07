# AURA Skills Catalog & Specifications

Skills are discrete, reusable capabilities agents call into. Keeping them as separate, independently-testable units (rather than baking logic into each agent's prompt) lets Fact/Citation/Contradiction agents share infrastructure instead of duplicating retrieval or scoring logic.

Each skill below lists: what it does, its call signature, what it must guarantee, and what it explicitly does *not* do (to keep skill boundaries clean).

---

## Retrieval Skills

### `semantic_search(query, top_k, min_similarity)`
- **Does:** Embeds `query`, searches Qdrant, returns passages above `min_similarity`.
- **Guarantees:** Never returns a passage below threshold padded in just to fill `top_k` — an empty result is a valid, meaningful result.
- **Does not:** Rank by source trust — that's a separate step (`apply_trust_weighting`), kept separate so trust policy can change without touching the retrieval call itself.

### `graph_lookup(entities, relation_type)`
- **Does:** Queries Neo4j for relationships between named entities relevant to a claim.
- **Guarantees:** Returns `last_verified` timestamp on every edge.
- **Does not:** Perform entity resolution/disambiguation — that's `resolve_entities` (below), run before this skill, not inside it.

### `resolve_entities(text)`
- **Does:** Named-entity extraction + linking to canonical KG node IDs.
- **Guarantees:** Ambiguous entities (e.g., "Washington" the person vs. the state) return multiple candidates with confidence rather than a silent best-guess pick.
- **Does not:** Decide which candidate is "correct" for the claim — that judgment stays with the calling agent, which has claim context this skill doesn't.

### `apply_trust_weighting(evidence_list)`
- **Does:** Attaches `source_trust_tier` from ingestion metadata to each evidence item.
- **Guarantees:** Tier is looked up, never inferred from content at query time.

---

## Verification Skills

### `check_entailment(claim, evidence_passage)`
- **Does:** Determines whether `evidence_passage` semantically entails, contradicts, or is neutral toward `claim`. Shared by the Fact Agent (claim vs. retrieved evidence) and Citation Agent (claim vs. cited passage) — one implementation, two callers.
- **Guarantees:** Returns one of exactly `{entails, contradicts, neutral}` plus confidence — no free-text verdicts that downstream code would need to parse.
- **Does not:** Decide the final claim verdict — entailment is one input to that decision, not the decision itself.

### `check_citation_exists(source_ref)`
- **Does:** Verifies a cited source is resolvable (fetchable/indexed), distinct from whether its content supports the claim.
- **Guarantees:** Distinguishes `not_found` (source doesn't exist / fabricated) from `unreachable` (transient fetch failure) — these must route to different verdicts (`invalid` vs. `n/a`, per `AGENTS.md §5`).

### `detect_numeric_date_conflict(claim_a, claim_b)`
- **Does:** Structured comparison of numeric values, dates, and quantities between two claims or a claim and an evidence item.
- **Guarantees:** Only flags a conflict when values are directly comparable (same unit, same referent) — mismatched scope (e.g., "in 2020" vs. "as of 2023") is not a false conflict.
- **Does not:** Handle natural-language logical contradiction (e.g., "always" vs. "never") — that's `detect_logical_conflict`.

### `detect_logical_conflict(claim_a, claim_b)`
- **Does:** LLM-based check for logical/semantic contradiction not reducible to a numeric comparison.
- **Guarantees:** Defaults to `no_conflict` on ambiguous scope/qualifier differences (see `AGENTS.md §6` guardrail) rather than over-flagging.

---

## Aggregation Skills

### `aggregate_verdicts(verification_results, weights)`
- **Does:** Implements the deterministic precedence + weighted-scoring rule from `AURA_ARCHITECTURE_README.md §3.6`.
- **Guarantees:** Pure function — same inputs always produce the same `bucket` and `score`. This is what makes the Evaluator's decision testable without mocking an LLM.
- **Does not:** Call an LLM. Aggregation is code logic; only the individual verification skills above use LLM calls.

### `renormalize_weights(available_agents, base_weights)`
- **Does:** Adjusts weighting when one agent's result is missing (timeout/error) so the average isn't silently skewed.
- **Guarantees:** Weights always sum to 1.0 over whatever subset actually reported.

---

## Repair Skills

### `rewrite_claim(claim, evidence, mode)`
- **Does:** Produces a corrected or hedged version of a single claim. `mode` is `correct` (evidence contradicts — rewrite to match) or `hedge` (insufficient evidence — add uncertainty qualifier) or `remove`.
- **Guarantees:** Output is scoped to the single claim's span; never touches surrounding text.
- **Does not:** Re-verify its own output — that's a separate call back into `check_entailment`/Fact Agent, run by the Self-Repair Agent as a post-check (bounded by `max_iterations`).

### `apply_edits(original_text, edits)`
- **Does:** Deterministically splices approved edits into the original text by span offset.
- **Guarantees:** Non-overlapping edits only apply cleanly; overlapping edits raise an explicit conflict for the Orchestrator to resolve rather than applying silently in an undefined order.

---

## Infrastructure / Cross-Cutting Skills

### `log_trace(trace_id, event, payload)`
- **Does:** Writes a structured audit event to PostgreSQL.
- **Guarantees:** Called at every state transition (see `AGENTS.md §1`); failures to log are surfaced as warnings, never silently swallowed, since audit gaps defeat the traceability goal.

### `route_model(task_complexity, confidence_hint)`
- **Does:** Chooses between local (Ollama) and cloud LLM execution per the hybrid strategy in the architecture README §4.
- **Guarantees:** Routing decision is logged alongside the result, so cost/quality tradeoffs can be audited and tuned later.

### `batch_claims(claims, agent_type)`
- **Does:** Groups claims into a single structured-output call per agent type instead of one call per claim (architecture README §4 mitigation #1).
- **Guarantees:** Batch size is capped (default 10) to keep structured-output parsing reliable; overflow spawns an additional batch, not a larger single call.

### `cache_lookup(claim_hash)` / `cache_store(claim_hash, result)`
- **Does:** Keys on a normalized claim text hash to skip redundant retrieval + verification for repeated/near-duplicate claims across requests.
- **Guarantees:** Cache entries carry the same `last_verified`-style staleness metadata as KG edges, so stale cached verdicts get invalidated rather than served indefinitely.

---

## Skill Boundaries — Rule of Thumb

If you're about to add logic to an agent's prompt that could instead be a deterministic function, it belongs here as a skill, not in the prompt. Skills should be the parts of the system you can unit test without an LLM call; agents are the parts that genuinely require model judgment (entailment, rewriting, ambiguous logical conflict detection). Keeping that line clear is what makes the Evaluator's aggregation (Section "Aggregation Skills" above) fully deterministic and testable, per the architecture README's design principles.
