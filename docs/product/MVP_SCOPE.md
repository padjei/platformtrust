# MVP Scope — AI Readiness Auditor

> **READ THIS BEFORE PLANNING ANY FEATURE.**
> This document is the authoritative boundary for the current milestone. If a proposed feature is not in scope here, it does not go in the MVP. When in doubt, this file wins.

> **Related docs:** [Product Vision](./PRODUCT_VISION.md) · [PRD](./PRD.md) · [Roadmap](./ROADMAP.md) · [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)

## 1. The One-Sentence Scope

The MVP is the **AI Readiness Auditor**: a multi-tenant tool that lets an organization create a readiness assessment, run it across a fixed set of readiness domains, collect supporting evidence, produce deterministic readiness scores and findings, and generate a prioritized remediation roadmap.

## 2. Why This Boundary Exists

The long-term product (see [Product Vision](./PRODUCT_VISION.md)) spans assessment through continuous trust operations. The MVP intentionally delivers **only the assessment foundation** so that later phases — monitors, drift detection, remediation — build on a proven, deterministic, multi-tenant, evidence-backed core rather than being built speculatively.

## 3. IN Scope

### 3.1 Tenancy & identity
- Multi-tenant data model: `tenant_id` on every tenant-owned record; UUID primary keys; UTC timestamps.
- Tenant isolation enforced at the **API layer** and via **PostgreSQL Row-Level Security**. See [Multi-Tenancy](../architecture/MULTI_TENANCY.md).
- Basic users and roles within a tenant.

### 3.2 Readiness assessment lifecycle
- Create an assessment (scoped to a tenant).
- Run readiness **domains**: Data, Security, Governance, Infrastructure, Operations.
- Each domain contains **controls** with deterministic evaluation producing a `ControlResult` (pass / fail / partial / not-applicable).
- **Deterministic readiness scoring** rolled up from control results to domain and assessment scores.

### 3.3 Evidence
- Attach and collect **evidence** for controls.
- Evidence artifacts stored in **Azure Blob**; metadata in PostgreSQL. See [Domain Model](../architecture/DOMAIN_MODEL.md).

### 3.4 Findings & remediation roadmap
- Generate **findings** from failed/partial controls.
- Generate a prioritized **remediation roadmap** (remediation items with priority, effort, business-impact explanation).

### 3.5 Connectors (read-only, assessment support)
- Connector framework with a stable adapter interface, **read-only by default**, credentials via **Azure Key Vault**.
- MVP connectors: `generic-rest`, `webhook`, `aws-s3`, `azure-blob`, `salesforce`, `sftp`.
- External data normalized to the **PlatformTrust event schema**. See [Connector Framework](../architecture/CONNECTOR_FRAMEWORK.md) and [Event Model](../architecture/EVENT_MODEL.md).

### 3.6 AI assistance (bounded)
- LLM used only to **draft explanations** and **summarize business impact** of findings.
- **LLM output never determines** control pass/fail, authorization, compliance status, production changes, or final risk scores.
- Any AI machine-readable output must be **schema validated**.

### 3.7 Auditability
- Audit events for significant actions (assessment created, control evaluated, evidence added, roadmap generated).

### 3.8 Platform & infra
- Modular monolith (`services/api`) + background worker (`services/worker`) + web app (`apps/web`).
- Deployed on **Azure Container Apps**, **Azure Database for PostgreSQL**, **Azure Key Vault**; provisioned with **Terraform**; CI/CD via **GitHub Actions**.
- **Redis only when justified** (e.g., job queue / rate limiting), not by default.

## 4. OUT of Scope (Explicitly Excluded from MVP)

These are **future phases** (see [Roadmap](./ROADMAP.md)) and must not be scoped into the MVP:

| Excluded | Notes |
|----------|-------|
| **Advanced continuous monitoring** | Converting controls to live monitors is Phase 2. |
| **Autonomous remediation** | All remediation is human-driven in MVP; approval-based automated remediation is Phase 4. |
| **Customer-side agents** | No agents deployed into customer environments. |
| **Kafka** | No streaming/event-bus infrastructure. |
| **Kubernetes** | Use Azure Container Apps, not K8s. |
| **Neo4j** | The trust graph is a **simplified relational representation** in MVP. See [Trust Graph](../architecture/TRUST_GRAPH.md). |
| **ClickHouse** | Analytics live in PostgreSQL for MVP. |
| **Continuous drift/failure detection** | Phase 3. |
| **Write-capable connectors / production changes** | Connectors are read-only; no production mutation. |

## 5. MVP Acceptance Criteria

The MVP is complete when a tenant user can:

1. Create an assessment within an isolated tenant.
2. Run all five readiness domains with deterministic control evaluation.
3. Attach evidence to controls, stored in Azure Blob with metadata in PostgreSQL.
4. Receive deterministic domain and overall readiness scores.
5. See findings for failed/partial controls with an AI-drafted, schema-validated business-impact explanation.
6. Generate a prioritized remediation roadmap.
7. Do all of the above with **verified tenant isolation** (RLS + API), UUID PKs, UTC timestamps, and audit events recorded.
8. Configure at least the read-only connectors that feed evidence, with credentials in Key Vault.

## 6. Decision Rule for New Feature Requests

1. Is it required to meet an acceptance criterion in §5? → In scope.
2. Is it in the §4 exclusion list? → Out of scope, defer to [Roadmap](./ROADMAP.md).
3. Does it violate an [architecture rule](../architecture/SYSTEM_ARCHITECTURE.md) (determinism, tenancy, read-only connectors, human approval)? → Rejected.
4. Otherwise → escalate; default to **out of scope** to protect MVP focus.
