# ADR-004: Deterministic Scoring; LLMs Assist Explanation Only

**Status:** Accepted

## Context

AI PlatformTrust is a trust product: customers and their stakeholders act on
its readiness scores, gaps, and remediation roadmaps. For a trust platform,
results must be **reproducible, explainable, auditable, and defensible**. LLMs
are useful for drafting human-readable explanations, but they are
non-deterministic, can hallucinate, and are susceptible to prompt injection
from untrusted evidence and connector data (see
[`../security/THREAT_MODEL.md`](../security/THREAT_MODEL.md#6-llm-specific-threats)).

If an LLM determined pass/fail or scores, results could vary run-to-run, could
be manipulated via crafted evidence, and could not be defended to an auditor.
That is unacceptable for this product.

## Decision

Readiness scoring is **deterministic**. A rules-based engine computes all
control result states and scores from validated inputs and the control
library, producing identical output for identical input (see
[`../frameworks/SCORING_MODEL.md`](../frameworks/SCORING_MODEL.md)).

**LLMs assist explanation only.** Specifically, LLM output **never** determines:

- control pass/partial/fail,
- authorization decisions,
- compliance status,
- production changes,
- or final risk/readiness scores.

The LLM may draft explanations, summaries, and suggested remediation *text*.
Any AI machine-readable output must be **schema validated** before use, is
treated as untrusted, and is subject to human review. **Production remediation
requires explicit human approval** (see
[`../security/AUTHORIZATION_MODEL.md`](../security/AUTHORIZATION_MODEL.md)).

## Consequences

**Positive**
- Reproducible, auditable, defensible results — essential for a trust product.
- Robust against prompt injection and hallucination affecting outcomes.
- Clear separation of concerns: deterministic engine decides, LLM explains.
- Human accountability preserved for consequential actions.

**Negative / trade-offs**
- Scoring rules and the control library must be explicitly designed and
  maintained (no "let the model figure it out").
- Some nuance an LLM might surface must be encoded as rules or handled by human
  assessors.
- Requires guardrails (schema validation, output sanitization) around every
  LLM integration.

## Alternatives considered

- **LLM-determined scoring** — rejected: non-deterministic, non-defensible,
  and manipulable via crafted evidence; violates the product's trust premise.
- **Hybrid where LLM proposes and rules confirm** — rejected as the scoring
  authority: adds complexity and risk of automation bias; the LLM is confined
  to explanation, with humans reviewing and approving.
- **No LLM at all** — rejected: LLMs add real value for drafting clear
  explanations and remediation language, which is safe when they cannot affect
  decisions or scores.
