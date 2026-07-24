# AI Safety Rules

LLMs assist with explanation and drafting. They never hold authority.

## Authority boundary
- **Don't** let an LLM decide **pass/fail, authorization, compliance, risk rating,
  or scoring**. Those are determined by deterministic rules and/or human approval.
- **Do** use LLMs only to explain findings, summarize evidence, draft remediation
  text, and improve readability — as advisory output.
- **Do** keep the deterministic scoring engine as the single source of truth for
  results (see `architecture.md`).

## Structured output
- **Do** require machine-readable AI output to conform to an explicit schema
  (Pydantic/JSON Schema) and **validate it** before use.
- **Do** fail closed: if AI output fails validation, reject it and fall back to a
  safe default or human review — never proceed on unvalidated output.
- **Don't** `eval`/execute, or take privileged action from, raw model text.

## Remediation and approval
- **Do** require **human approval** before any production remediation is applied.
- **Do** record the AI suggestion, the deterministic finding, and the human
  decision in the audit trail.
- **Don't** allow AI-suggested changes to auto-apply to customer environments.

## Data protection in prompts
- **Don't** send secrets, credentials, or PII/customer-identifying data to LLMs.
  Redact, tokenize, or use synthetic references.
- **Do** minimize context sent to models to what the task requires.
- **Do** treat model output as untrusted input to downstream systems (validate,
  sanitize, scope).

## Transparency
- **Do** clearly label AI-generated explanations/suggestions as advisory in the UI.
- **Don't** imply AI output constitutes certification or a compliance guarantee.
