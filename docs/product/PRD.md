# Product Requirements Document — AI Readiness Auditor (MVP)

> **Related docs:** [Product Vision](./PRODUCT_VISION.md) · [Personas](./PERSONAS.md) · [MVP Scope](./MVP_SCOPE.md) · [Roadmap](./ROADMAP.md) · [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md) · [Domain Model](../architecture/DOMAIN_MODEL.md)

> This PRD covers **only** the AI Readiness Auditor MVP. Anything not required by the acceptance criteria in [MVP_SCOPE.md](./MVP_SCOPE.md) is out of scope.

## 1. Overview

The AI Readiness Auditor lets an organization assess its readiness to adopt and operate AI. A tenant user creates an assessment, runs it across five readiness domains, collects evidence, receives deterministic readiness scores and findings, and generates a prioritized remediation roadmap.

## 2. Goals

- G1 — Give organizations a **deterministic, reproducible** readiness score across data, security, governance, infrastructure, and operations.
- G2 — Make every readiness claim **evidence-backed** and auditable.
- G3 — Turn readiness gaps into a **prioritized, actionable remediation roadmap** with clear business impact.
- G4 — Enforce **strict multi-tenant isolation** from day one.
- G5 — Establish a **neutral connector framework** (read-only) so assessment can pull evidence from many systems.
- G6 — Lay the foundation for later conversion of controls into continuous monitors (without building them now).

## 3. Non-Goals

- N1 — Continuous monitoring, drift/failure detection (Phases 2–3).
- N2 — Autonomous or automated production remediation (Phase 4).
- N3 — Customer-side agents.
- N4 — Kafka, Kubernetes, Neo4j, ClickHouse.
- N5 — Write-capable connectors or any production mutation.
- N6 — Letting LLM output decide pass/fail, authorization, compliance status, production changes, or final risk scores.

## 4. Personas (summary)

See [PERSONAS.md](./PERSONAS.md) for detail. Primary MVP users: **CISO**, **AI/Platform Engineering Lead**, **Compliance/Governance Officer**, **Data Owner**, **Executive Sponsor**.

## 5. User Stories

### Assessment
- As an **AI/Platform Engineering Lead**, I can create an assessment scoped to my tenant so I can measure our AI readiness.
- As a **Platform Lead**, I can run each readiness domain and see per-control results so I know exactly what passed and failed.
- As any user, I only ever see data belonging to my own tenant.

### Evidence
- As a **Data Owner**, I can attach evidence (documents, exports, connector-pulled artifacts) to a control so results are defensible.
- As a **Compliance Officer**, I can trace every control result back to its evidence.

### Scoring & findings
- As an **Executive Sponsor**, I can see an overall readiness score and per-domain scores at a glance.
- As a **CISO**, I can see findings for failed/partial controls, each with a plain-language business-impact explanation.

### Remediation
- As an **AI/Platform Engineering Lead**, I can generate a prioritized remediation roadmap so my team knows what to fix first.
- As an **Executive Sponsor**, I can understand the business impact and estimated effort of each remediation item.

### Connectors
- As a **Platform Lead**, I can configure a read-only connector so evidence is pulled automatically, with credentials held in Key Vault.

## 6. Functional Requirements

### 6.1 Tenancy (FR-T)
- FR-T1 — Every tenant-owned record has a `tenant_id` and a UUID primary key.
- FR-T2 — Isolation enforced in the API layer **and** PostgreSQL RLS; a client-supplied tenant id is never trusted.
- FR-T3 — All timestamps stored in UTC.

### 6.2 Assessment (FR-A)
- FR-A1 — Create/read/update an assessment within a tenant.
- FR-A2 — An assessment is composed of the five readiness domains (Data, Security, Governance, Infrastructure, Operations).
- FR-A3 — Each domain contains a defined set of controls.

### 6.3 Control evaluation (FR-C)
- FR-C1 — Each control produces a `ControlResult`: `pass | fail | partial | not_applicable`.
- FR-C2 — Evaluation is **deterministic** and reproducible from the same inputs/evidence.
- FR-C3 — LLM output must not set the control result.

### 6.4 Evidence (FR-E)
- FR-E1 — Attach evidence to a control; artifact stored in Azure Blob, metadata in PostgreSQL.
- FR-E2 — Evidence may be uploaded manually or pulled by a read-only connector.
- FR-E3 — Evidence is tenant-scoped and immutable once recorded (new versions create new records).

### 6.5 Scoring (FR-S)
- FR-S1 — Deterministic roll-up: control results → domain score → overall readiness score.
- FR-S2 — Scoring algorithm is documented and versioned.
- FR-S3 — Final scores are never influenced by LLM output.

### 6.6 Findings & roadmap (FR-R)
- FR-R1 — Generate findings from failed/partial controls.
- FR-R2 — Each finding may include an **AI-drafted, schema-validated** business-impact explanation.
- FR-R3 — Generate a remediation roadmap of prioritized `RemediationItem`s (priority, effort estimate, linked findings/controls).

### 6.7 Connectors (FR-K)
- FR-K1 — Adapter interface as defined in [Connector Framework](../architecture/CONNECTOR_FRAMEWORK.md).
- FR-K2 — Connectors are **read-only by default**; credentials via Key Vault.
- FR-K3 — External data normalized to the [PlatformTrust event schema](../architecture/EVENT_MODEL.md).
- FR-K4 — MVP connectors: `generic-rest`, `webhook`, `aws-s3`, `azure-blob`, `salesforce`, `sftp`.

### 6.8 Audit (FR-AU)
- FR-AU1 — Record audit events for assessment creation, control evaluation, evidence changes, and roadmap generation.

## 7. Key Flows

### 7.1 Create assessment
1. User (in tenant T) requests a new assessment.
2. API validates the tenant session (never trusting a client tenant id).
3. Assessment created with UUID, `tenant_id = T`, UTC `created_at`.
4. Domains and controls instantiated. Audit event recorded.

### 7.2 Run readiness domains
1. User triggers evaluation of a domain (or all domains).
2. Worker (`services/worker`) evaluates controls deterministically using evidence and normalized connector events.
3. Each control yields a `ControlResult`. Domain score computed.
4. Audit events recorded per evaluated control.

### 7.3 Collect evidence
1. User uploads an artifact, or a read-only connector pulls it.
2. Connector output normalized to the event schema.
3. Artifact stored in Azure Blob; `Evidence` metadata row written (tenant-scoped, UUID).
4. Evidence linked to the relevant control(s).

### 7.4 Generate remediation roadmap
1. After scoring, system produces findings from failed/partial controls.
2. LLM drafts business-impact explanations; output is schema validated before persistence.
3. `RemediationItem`s created with deterministic priority/effort; roadmap assembled and returned.
4. Audit event recorded.

## 8. Success Metrics

| Metric | Target (MVP) |
|--------|--------------|
| Time to first readiness score | A new tenant can go from account to first scored assessment in under one working session. |
| Determinism | Re-running scoring on unchanged inputs yields identical scores 100% of the time. |
| Evidence coverage | ≥ 90% of evaluated controls have at least one linked evidence artifact. |
| Tenant isolation | 0 cross-tenant data access in automated isolation tests (must be 0). |
| Roadmap actionability | ≥ 80% of generated remediation items rated actionable by pilot users. |
| Schema validation | 100% of AI machine-readable outputs pass schema validation before use. |

## 9. Constraints & Assumptions

- Cloud-, application-, and model-neutral core (see [Product Vision](./PRODUCT_VISION.md) §5.1).
- Stack per repository standards: Next.js/React/TS frontend; FastAPI/Python backend; PostgreSQL + RLS; Azure Blob; Redis only when justified.
- All schema changes via **Alembic migrations**.
