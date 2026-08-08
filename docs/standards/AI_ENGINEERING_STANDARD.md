# AI Engineering Standard

| Attribute      | Value                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| Document owner | PlatformTrust Engineering                                                 |
| Applies to     | All AI features, prompts, retrieval, and machine-readable AI output       |
| Source issue   | PT-002 §15                                                                |
| Precedence     | Below the Constitution, ADRs, security requirements, and the Handbook     |

---

## 1. Purpose

This standard translates the PlatformTrust Constitution's artificial-intelligence
articles and Handbook §27 into concrete, reviewable engineering rules for building
AI features. It exists so that a reviewer can objectively determine whether a
change that uses AI keeps the model advisory, keeps humans in authority, keeps
tenant data isolated, and keeps machine-readable AI output validated before use.

PlatformTrust is model-neutral. This document does **not** select an AI model,
provider, vector database, embedding model, or agent framework; those selections
are deferred to a future ADR (Handbook §10.1). It codifies the requirements that
hold regardless of which provider is later approved.

## 2. Scope

This standard applies to:

- All code that calls, orchestrates, or consumes a language model or other AI
  service, wherever it runs (for the MVP, primarily `apps/ai-service`).
- All prompts, prompt templates, retrieval pipelines, and structured-output
  schemas used by an AI feature.
- All first-party code and coding agents, per Constitution §3.3 and Handbook §3.3.

This standard does not select a provider, model, vector store, embedding model, or
agent framework, and it does not define product behavior, scoring rules, or
compliance conclusions. Those are owned by the sources named in Constitution §3.3
and, where AI authority is concerned, may not be invented by an implementation
agent.

## 3. Mandatory requirements

### 3.1 AI is advisory by default

- AI output MUST be treated as advisory. It MUST NOT determine control pass/fail,
  authorization, compliance status, risk ratings, readiness scores, or production
  changes (Constitution Article XI; CLAUDE.md; `.claude/rules/ai-safety.md`).
- Deterministic rules and/or human decisions MUST remain the single source of
  truth for any such result (Constitution Article XVI; Coding Standard §3.5).
- AI MAY explain findings, summarize evidence, classify, prioritize, or draft
  text, provided the result is not used as an authoritative decision.

### 3.2 Humans retain authority over high-impact decisions

- A high-impact decision (final audit conclusion, compliance certification, risk
  acceptance, destructive data action, access revocation, security-incident
  closure, regulatory submission, or broad production change) MUST require
  attributable, auditable human approval before it takes effect (Constitution
  Article XI; Handbook §27 "Human Approval").
- AI MUST NOT autonomously execute a high-impact or production remediation action.
  The AI suggestion, the deterministic finding, and the human decision MUST be
  recorded in the audit trail (Constitution Article II).

### 3.3 AI output is not verified fact

- AI-generated content MUST be clearly distinguishable from verified system facts,
  human decisions, approved compliance conclusions, and completed operational
  actions (Constitution Article X).
- AI MUST NOT present uncertainty as certainty. Where reasonably supported, output
  SHOULD carry supporting evidence, source references, model identifier, prompt or
  template version, confidence or uncertainty, limitations, and a trace identifier
  (Constitution Article X; Handbook §27).
- Output surfaced to users MUST be labeled as advisory and MUST NOT imply
  certification or a compliance guarantee (`.claude/rules/ai-safety.md`).

### 3.4 Provider and model abstraction

- All provider- and model-specific behavior MUST stay behind an adapter interface.
  Core and domain code MUST depend on the interface, not on a concrete provider,
  model, vector store, or embedding model (Coding Standard §3.5; Constitution
  Article IX).
- The concrete AI provider, model, vector database, embedding model, and agent
  framework are deferred to a future ADR and MUST NOT be assumed by name in shared
  code. Only approved providers, models, and regions may be used once selected
  (Constitution Article XII; Handbook §27).

### 3.5 Prompt management and versioning

- Prompts and prompt templates MUST be version-controlled in the repository,
  named, and documented. They MUST NOT live only in a provider dashboard or on an
  individual machine (Handbook §27 "Prompt Management").
- Each prompt MUST be associated with its expected output schema (where output is
  machine-readable) and MUST be traceable to the version that produced a given
  result where appropriate (Constitution Article X).

### 3.6 Structured-output validation (fail closed)

- Machine-readable AI output MUST be validated against an explicit schema before
  any downstream system uses it (CLAUDE.md; Handbook §27 "AI Output Schemas").
- Validation MUST fail closed: malformed, incomplete, or schema-violating output
  MUST be rejected and MUST fall back to a safe default or human review. Code MUST
  NOT proceed on unvalidated output (`.claude/rules/ai-safety.md`;
  Constitution Article XIII).
- Raw model text MUST NOT be executed, `eval`-ed, or used to take a privileged
  action.

### 3.7 Grounding and source traceability

- Where a feature makes claims that should be supported by evidence, the AI output
  SHOULD carry source references or citations to the grounding material, and
  SHOULD distinguish grounded statements from model-generated commentary
  (Constitution Article X; Handbook §27 "Retrieval-Augmented Generation").
- Unsupported compliance conclusions MUST NOT be presented as grounded facts
  (`.claude/rules/ai-safety.md`).

### 3.8 Tenant-safe retrieval

- Retrieval MUST enforce the tenant filter before or during retrieval. Mixing
  tenants and post-filtering the results is prohibited (Handbook §27; Constitution
  Article I).
- Retrieval, indexes, embeddings, and any AI-accessible store MUST carry and
  respect tenant context; AI retrieval MUST NOT return another tenant's data
  (Constitution Article I; `.claude/rules/ai-safety.md`).
- Deletion of tenant source data MUST propagate to any derived index or embedding
  according to the owning ticket's requirements (Handbook §27).

### 3.9 Prompt-injection and untrusted content

- Model output and any retrieved or connector-supplied content MUST be treated as
  untrusted input to downstream systems: validate, sanitize, and scope it before
  use (Handbook §14; Coding Standard §3.4; `.claude/rules/ai-safety.md`).
- Instructions embedded in retrieved documents, user input, or connector data MUST
  NOT be allowed to escalate privilege, bypass tenant scoping, or trigger a
  privileged action.

### 3.10 Evaluation before model or prompt changes

- A material change to a model, prompt, retrieval pipeline, or output schema MUST
  be evaluated before release, against the criteria in Handbook §27 "AI
  Evaluation" (for example accuracy, groundedness, hallucination, tenant
  isolation, and prompt-injection resistance) (Constitution Article XVI).
- This standard does not set numeric evaluation thresholds; thresholds and
  datasets are owned by the relevant ticket or a future ADR. Evaluation results
  MUST be recorded so the change is traceable (Constitution Article XXII).

### 3.11 Safe failure and fallback

- When an AI service fails, times out, produces low-confidence output, lacks
  evidence, or violates a guardrail, the system MUST NOT present the output as
  authoritative, MUST preserve the underlying workflow, MUST communicate the
  limitation, MUST record the failure, and MUST allow safe human continuation
  (Constitution Article XIII).
- AI failure MUST NOT compromise tenant isolation, data integrity, or user
  authority (Constitution Article XIII).

### 3.12 Customer data is not training data by default

- Customer data MUST NOT be used to train, fine-tune, or improve a shared model
  without explicit contractual and technical authorization. Where a provider
  offers a training opt-out, it MUST be disabled by default (Constitution Article
  XII).
- Provider changes affecting data handling MUST undergo review before adoption
  (Constitution Article XII; Handbook §20 security-review triggers).

### 3.13 Sensitive-data minimization before submission

- Secrets, credentials, PII, and customer-identifying data MUST NOT be sent to an
  AI provider. Redact, tokenize, or use synthetic references, and send only the
  minimum context the task requires (Constitution Article VI;
  `.claude/rules/ai-safety.md`; Handbook §23).
- Prompts, prompt logs, and AI telemetry MUST NOT capture sensitive customer data
  unless explicitly approved and protected (Constitution Article VI; Handbook §23).

## 4. Prohibited practices

- MUST NOT let AI decide pass/fail, authorization, compliance status, risk
  ratings, scoring, or production changes.
- MUST NOT auto-apply an AI-suggested change to a customer environment or execute
  a high-impact action without recorded human approval.
- MUST NOT proceed on machine-readable AI output that has not been schema-validated,
  or execute raw model text.
- MUST NOT hardcode a specific AI provider, model, vector database, embedding
  model, or agent framework into shared or domain code.
- MUST NOT retrieve across tenant boundaries or post-filter mixed-tenant results.
- MUST NOT send secrets, credentials, PII, or customer-identifying data to an AI
  provider, or place them in prompts, prompt logs, or AI telemetry.
- MUST NOT use customer data for model training or fine-tuning without explicit
  authorization.
- MUST NOT store prompts only in a provider dashboard or on a developer machine.
- MUST NOT present AI output as verified fact, certification, or a compliance
  guarantee, or present uncertainty as certainty.
- MUST NOT ship a material model, prompt, retrieval, or schema change without
  evaluation.

## 5. Examples

Fail-closed structured-output validation (illustrative, Python):

```python
# Prohibited: downstream code trusts raw model output.
result = model.complete(prompt)
finding.summary = result.text  # unvalidated; may be malformed or injected


# Required: validate against an explicit schema and fail closed.
raw = model.complete(prompt)
try:
    parsed = FindingSummary.model_validate_json(raw.text)  # schema-validated
except ValidationError as error:
    logger.warning("ai.output_invalid", extra={"prompt_version": PROMPT_VERSION})
    return fall_back_to_human_review(cause=error)  # never proceed on bad output

finding.summary = parsed.summary  # advisory only; does not set pass/fail
```

Advisory boundary (illustrative):

```text
Prohibited: control.status = ai.decide(evidence)      # AI decides pass/fail
Required:   control.status = scoring_engine.evaluate(evidence)  # deterministic
            control.explanation = ai.summarize(evidence)        # advisory text
```

## 6. Enforcement mechanisms

Enforcement of this standard is currently **process- and review-based, with future
automation planned**; a rule without enforcement is tracked as a gap (standards
`README.md`).

- Automated today (for `apps/ai-service`): `uv run ruff check .`,
  `uv run ruff format --check .`, `uv run mypy .`, and `uv run pytest` in
  [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml); gitleaks secret
  scanning and dependency audit in
  [`.github/workflows/security.yml`](../../.github/workflows/security.yml). These
  enforce code quality and secret hygiene, **not** AI-specific behavior.
- Process today: pull-request review, including the AI-impact section of the
  [pull request template](../../.github/pull_request_template.md); review of
  AI-generated code as untrusted (Handbook §14); security review for new AI
  providers or sensitive data processing (Handbook §20).
- Not yet automated: AI evaluations, groundedness/hallucination checks, tenant-safe
  retrieval tests, prompt-injection tests, and prompt/schema-drift gates. These
  are enforced by the owning ticket, evaluation harnesses, and review until a
  future ADR introduces automated gates. See
  [ENFORCEMENT_MATRIX.md](./ENFORCEMENT_MATRIX.md).

## 7. Exception process

Deviations from this standard are not silent (Constitution §6). Any deviation MUST
record the affected rule, the reason, the compensating controls, an owner, and an
expiration or remediation plan. A material deviation — anything touching AI
authority, tenant isolation, customer-data handling, or human approval — MUST be
captured in an ADR and approved before merge (Handbook §10). Silent exceptions are
prohibited.

## 8. Related Constitution articles

- Article X — Explainable AI (output distinguishable from verified fact; must not
  present uncertainty as certainty).
- Article XI — Humans retain authority over high-impact decisions.
- Article XII — Customer data is not training data by default.
- Article XIII — AI must fail safely (must not compromise tenant isolation or user
  authority).
- Article VI — Privacy and data minimization; Article I — Multi-tenancy; Article II
  — Auditability; Article XVI — Testability; Article XVII — Observability.
- §3.3 agents may not invent AI authority; §5 Definition of Done; §6 Exception
  process.

See [PlatformTrust Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md).

## 9. Related Handbook sections

- §27 Artificial Intelligence Engineering (providers, prompt management, RAG,
  evaluation, output schemas, human approval); §14 AI-generated code reviewed as
  untrusted; §23 Logging Standards; §28 Testing Strategy (AI evaluations); §47
  Definition of Done.

See [Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md), the
[Testing Standard](./TESTING_STANDARD.md), the
[Secure Coding Standard](./SECURE_CODING_STANDARD.md), the
[Definition of Done](./DEFINITION_OF_DONE.md), and the repository AI-safety rules
in [`.claude/rules/ai-safety.md`](../../.claude/rules/ai-safety.md).
