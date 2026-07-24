# System Architecture — AI PlatformTrust

> **Related docs:** [Domain Model](./DOMAIN_MODEL.md) · [Multi-Tenancy](./MULTI_TENANCY.md) · [Connector Framework](./CONNECTOR_FRAMEWORK.md) · [Event Model](./EVENT_MODEL.md) · [Trust Graph](./TRUST_GRAPH.md) · [MVP Scope](../product/MVP_SCOPE.md)

## 1. Architectural Style

AI PlatformTrust is a **modular monolith**. A single deployable API service is internally partitioned into modules with explicit boundaries (assessment, scoring, evidence, findings/remediation, connectors, tenancy, audit). A separate **worker** handles asynchronous evaluation and connector ingestion. A **web** app is the user interface.

This gives us clear module boundaries and independent scaling of background work **without** the operational cost of microservices, Kubernetes, or Kafka — all explicitly out of scope for the MVP (see [MVP Scope](../product/MVP_SCOPE.md) §4).

## 2. Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| **Web** | `apps/web` | Next.js/React/TS UI (Tailwind, shadcn, TanStack Query, RHF, Zod). Assessment, evidence, scores, roadmap. |
| **API** | `services/api` | FastAPI/Python modular monolith. Auth, tenancy enforcement, assessment lifecycle, deterministic scoring, findings/remediation, connector config, audit. |
| **Worker** | `services/worker` | Async control evaluation, connector ingestion, evidence pulls, roadmap generation. |
| **Shared packages** | `packages/*` | Shared types/schemas (event schema, control definitions, Pydantic/Zod contracts) reused across API, worker, and web. |
| **Connectors** | connector adapters | Read-only provider adapters normalizing to the [event schema](./EVENT_MODEL.md). |
| **PostgreSQL** | Azure Database for PostgreSQL | System of record with **Row-Level Security**. |
| **Azure Blob** | evidence store | Durable storage for evidence artifacts; metadata rows in PostgreSQL. |
| **Azure Key Vault** | secrets | Connector credentials and platform secrets. |
| **Redis** | optional | Job queue / rate limiting **only when justified**. |

## 3. Component Diagram (text)

```
                          ┌──────────────────────────┐
                          │        apps/web           │
                          │  Next.js / React / TS     │
                          │  Tailwind / shadcn /      │
                          │  TanStack Query / RHF/Zod │
                          └────────────┬──────────────┘
                                       │ HTTPS (tenant session)
                                       ▼
        ┌──────────────────────────────────────────────────────────┐
        │                     services/api  (FastAPI)                │
        │                     MODULAR MONOLITH                       │
        │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
        │  │ Tenancy/ │ │Assessment│ │ Scoring  │ │Findings &    │  │
        │  │ Auth     │ │ & Domains│ │(determin)│ │Remediation   │  │
        │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
        │  ┌──────────┐ ┌──────────┐ ┌──────────────────────────┐   │
        │  │ Evidence │ │Connector │ │ Audit                    │   │
        │  │          │ │ config   │ │                          │   │
        │  └──────────┘ └──────────┘ └──────────────────────────┘   │
        └───────┬───────────────┬───────────────────┬───────────────┘
                │               │                   │
    set current_tenant         │ enqueue jobs      │ read/write metadata
                │               ▼                   │
                │      ┌─────────────────┐          │
                │      │ services/worker │          │
                │      │  - evaluate     │          │
                │      │  - ingest       │──┐       │
                │      │  - roadmap gen  │  │       │
                │      └────────┬────────┘  │       │
                │               │           │ normalize
                ▼               ▼           ▼
        ┌──────────────┐  ┌──────────┐  ┌────────────────────────┐
        │ PostgreSQL   │  │Azure Blob│  │ Connectors (read-only) │
        │  + RLS       │  │ evidence │  │ generic-rest, webhook, │
        │ (system of   │  │ artifacts│  │ aws-s3, azure-blob,    │
        │  record)     │  └──────────┘  │ salesforce, sftp       │
        └──────────────┘                └───────────┬────────────┘
                ▲                                    │
                │ credentials                        │ pull evidence /
        ┌───────┴────────┐                           │ signals
        │ Azure Key Vault│◄──────────────────────────┘
        └────────────────┘
```

Shared schema/type packages (`packages/*`) are compile/runtime dependencies of web, API, and worker (not drawn as a runtime node).

## 4. Request Lifecycle (synchronous API call)

1. **Web → API** over HTTPS with an authenticated session that carries the tenant identity server-side.
2. **Auth & tenancy resolution:** API resolves `current_tenant` from the session. The client-supplied tenant id, if any, is **never trusted** (see [Multi-Tenancy](./MULTI_TENANCY.md)).
3. **RLS scoping:** the DB session sets the session-scoped `current_tenant`, so every query is transparently filtered by RLS.
4. **Module handling:** the request is routed to the owning module (e.g., assessment). Business rules run; deterministic logic stays out of the LLM path.
5. **Persistence:** writes go to PostgreSQL (UUID PKs, UTC timestamps, migrations for schema); artifacts to Azure Blob.
6. **Audit:** significant actions emit an `AuditEvent`.
7. **Response** returned to web; long-running work is delegated to the worker.

## 5. Asynchronous Lifecycle (worker)

1. API enqueues a job (control evaluation, connector ingestion, roadmap generation).
2. Worker picks it up, re-establishes tenant context, and processes deterministically.
3. Connector adapters pull data read-only and **normalize to the [event schema](./EVENT_MODEL.md)**.
4. Results (control results, scores, findings, remediation items, events) persisted under the correct tenant.
5. Any AI machine-readable output is **schema validated** before persistence; LLM output never sets pass/fail or scores.

## 6. Deployment

- **Runtime:** Docker containers on **Azure Container Apps** (API, worker, web).
- **Database:** **Azure Database for PostgreSQL** with RLS enabled.
- **Secrets:** **Azure Key Vault**.
- **Evidence:** **Azure Blob**.
- **IaC:** **Terraform**.
- **CI/CD:** **GitHub Actions**.
- **Migrations:** **Alembic**; all schema changes are migrations.

## 7. Cross-Cutting Rules

- Modular monolith with enforced module boundaries.
- `tenant_id` on every tenant-owned record; UUID PKs; UTC timestamps.
- Tenant isolation in the API **and** PostgreSQL RLS; never trust client tenant id.
- Provider formats confined to connector adapters; core sees only normalized events.
- Deterministic readiness scoring; LLM output never determines pass/fail, authorization, compliance status, production changes, or final risk scores.
- AI machine-readable output schema validated; production remediation requires human approval; connectors read-only by default.
