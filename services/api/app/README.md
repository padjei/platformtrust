# app

The FastAPI modular monolith. Business logic is organized into modules with clear boundaries:

- `api/` — HTTP layer: routers, request/response schemas, dependency wiring. No business logic.
- `domain/` — core domain models, services, and use cases (audits, assessments, evidence).
- `connectors/` — connector orchestration; adapters are read-only by default and normalize
  external data into the PlatformTrust event schema.
- `scoring/` — deterministic readiness scoring. Scoring is rules-based and reproducible;
  the LLM never decides pass/fail.
- `auth/` — authentication, authorization, and RBAC.
- `tenancy/` — tenant context, `tenant_id` propagation, and Row-Level Security enforcement.

Cross-module calls go through explicit service interfaces, keeping the monolith modular and
ready to split into services later.
