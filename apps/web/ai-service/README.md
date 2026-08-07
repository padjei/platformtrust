# PlatformTrust AI Service

This directory contains AI-specific PlatformTrust capabilities.

## Responsibilities

The AI service may provide:

- Document analysis.
- Control mapping.
- Evidence classification.
- Risk summarization.
- Policy assistance.
- Compliance recommendations.
- Retrieval-augmented generation.
- Embedding generation.
- Model routing.
- Prompt execution.
- AI evaluation.
- Explainability metadata.

## Non-Responsibilities

The AI service must not independently determine:

- User permissions.
- Tenant access.
- Final compliance status.
- Final audit conclusions.
- Final risk acceptance.
- Legal conclusions.
- Destructive system actions.
- Product behavior not defined in an approved specification.

## Required AI Response Metadata

Where applicable, AI responses must include:

- Output.
- Model identifier.
- Prompt or template version.
- Supporting source references.
- Confidence or uncertainty information.
- Safety or policy flags.
- Execution timestamp.
- Trace identifier.
- Human-review requirement.

## AI Governance Rules

- AI output is advisory unless explicitly approved for automation.
- High-impact actions require deterministic validation and human approval.
- Tenant data must not cross tenant boundaries.
- Customer data must not be used for model training without explicit approval.
- Sensitive data must be minimized before provider submission.
- Prompts must be version controlled.
- Model changes require evaluation before release.
- AI failures must fail safely.
- Hallucinations and unsupported claims must be measurable through evaluation.

## Planned Structure

```text
src/
├── agents/
├── prompts/
├── retrieval/
├── models/
├── providers/
├── guardrails/
├── evaluations/
├── telemetry/
└── main.*
