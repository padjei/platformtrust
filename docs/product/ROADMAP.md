# Roadmap — AI PlatformTrust

> **Related docs:** [Product Vision](./PRODUCT_VISION.md) · [PRD](./PRD.md) · [MVP Scope](./MVP_SCOPE.md) · [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)

> **Only Phase 1 is in active scope.** Phases 2–5 describe direction, not committed MVP work. Do not build them now — see [MVP_SCOPE.md](./MVP_SCOPE.md).

## Phasing Overview

| Phase | Theme | Status |
|-------|-------|--------|
| **1** | AI Readiness Auditor (MVP) | **Active** |
| 2 | Continuous monitors from approved controls | Future |
| 3 | Drift & failure detection | Future |
| 4 | Approval-based remediation | Future |
| 5 | Broader connector ecosystem | Future |

The product arc: **assess readiness → operate continuously → detect problems → remediate with approval → extend reach.** Each phase builds on the deterministic, multi-tenant, evidence-backed foundation of Phase 1.

## Phase 1 — AI Readiness Auditor (MVP) — ACTIVE

**Goal:** Deterministically assess AI readiness, back it with evidence, and produce a prioritized remediation roadmap, under strict multi-tenancy.

**Delivers:**
- Multi-tenant core (`tenant_id`, UUID PKs, UTC, RLS + API isolation).
- Assessment lifecycle across five domains (Data, Security, Governance, Infrastructure, Operations).
- Deterministic control evaluation and readiness scoring.
- Evidence capture (Azure Blob + metadata).
- Findings with AI-drafted, schema-validated business-impact explanations.
- Prioritized remediation roadmap.
- Read-only connector framework (`generic-rest`, `webhook`, `aws-s3`, `azure-blob`, `salesforce`, `sftp`) normalizing to the [event schema](../architecture/EVENT_MODEL.md).
- Audit events.

**Explicitly excluded:** continuous monitoring, autonomous remediation, customer-side agents, Kafka, Kubernetes, Neo4j, ClickHouse. See [MVP Scope](./MVP_SCOPE.md) §4.

**Exit criteria:** all acceptance criteria in [MVP Scope](./MVP_SCOPE.md) §5.

## Phase 2 — Continuous Monitors from Approved Controls — FUTURE

**Goal:** Convert **approved** readiness controls into continuous monitors so readiness posture stays current instead of going stale after assessment.

**Themes:**
- Promote a passed/approved control into a recurring monitor.
- Scheduling and periodic re-evaluation of monitored controls (still deterministic).
- Monitor state history built on the existing event schema.
- Redis / job infrastructure introduced only as justified.

**Depends on:** Phase 1 controls, evidence, and event schema.

## Phase 3 — Drift & Failure Detection — FUTURE

**Goal:** Detect **failures and drift** across applications, cloud platforms, data systems, integrations, storage services, and AI workloads.

**Themes:**
- Compare current normalized events against the approved baseline from monitored controls.
- Surface drift and failures as new findings with business impact.
- Trust-graph propagation of risk across dependencies (see [Trust Graph](../architecture/TRUST_GRAPH.md)).

**Depends on:** Phase 2 monitors.

## Phase 4 — Approval-Based Remediation — FUTURE

**Goal:** Support remediation of detected issues **with mandatory human approval** — never autonomous.

**Themes:**
- Suggest remediation actions tied to findings.
- **Human approval required** before any production change.
- Connectors may gain scoped, explicitly-approved write capabilities (still off by default).
- Full audit trail of who approved what.

**Non-negotiable:** production remediation requires human approval; LLM output never authorizes change.

## Phase 5 — Broader Connector Ecosystem — FUTURE

**Goal:** Expand the connector catalog well beyond the MVP set while preserving neutrality.

**Themes:**
- Additional cloud, data, security, and application connectors.
- Consistent adapter interface and normalization to the event schema.
- Community/partner connector contributions.

**Depends on:** the stable [Connector Framework](../architecture/CONNECTOR_FRAMEWORK.md) from Phase 1.

## Guardrails Across All Phases

- Cloud-, application-, and model-neutral.
- Deterministic scoring; LLM never decides pass/fail, authorization, compliance status, production changes, or final risk scores.
- Multi-tenant isolation (API + RLS); never trust client tenant id.
- Connectors read-only by default; production remediation requires human approval.
- AI machine-readable output must be schema validated.
