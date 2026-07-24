# ADR-002: PostgreSQL with Row-Level Security as Primary Data Store

**Status:** Accepted

## Context

AI PlatformTrust is multi-tenant. **Cross-tenant data access is the platform's
top risk** (see
[`../security/THREAT_MODEL.md`](../security/THREAT_MODEL.md#3-top-risk-cross-tenant-access)).
We need a primary data store that:

- models relational data well (tenants, users, assessments, controls, results,
  evidence metadata, audit),
- enforces tenant isolation at the database layer as a backstop to application
  code (defense in depth),
- supports deterministic scoring queries and strong consistency,
- is well supported on Azure and by our stack (SQLAlchemy, Alembic).

Specialized stores were considered — a graph database (Neo4j) for relationship
modeling and a columnar store (ClickHouse) for analytics — but neither is
needed for the MVP's workload, and neither provides the tenant-isolation
guarantees we want at the storage layer.

## Decision

Use **PostgreSQL** as the primary data store, with **Row-Level Security (RLS)**
as a core tenant-isolation mechanism:

- Every tenant-owned table carries a non-nullable `tenant_id`.
- RLS is enabled and **forced** on those tables; policies filter rows by a
  per-request session variable (`app.tenant_id`) set from the authenticated
  context, never from client input.
- The application connects as a non-superuser role so it cannot bypass RLS.

This is documented authoritatively in
[`../security/TENANT_ISOLATION.md`](../security/TENANT_ISOLATION.md). Access is
via SQLAlchemy with parameterized queries only; migrations via Alembic. Hosted
on Azure Database for PostgreSQL (see
[`ADR-003-azure-hosting.md`](./ADR-003-azure-hosting.md)).

## Consequences

**Positive**
- Database-enforced tenant isolation independent of application code — the
  backstop for our top risk.
- Mature relational modeling, transactions, and strong consistency for
  deterministic scoring (see
  [`../frameworks/SCORING_MODEL.md`](../frameworks/SCORING_MODEL.md)).
- First-class support in our stack and on Azure.

**Negative / trade-offs**
- RLS requires discipline: the session variable must be set on every
  connection/request and in background jobs; verified by required isolation
  tests.
- Must run as a non-superuser and avoid `BYPASSRLS` roles.
- Graph-style and heavy analytical queries are less natural than in
  specialized stores (acceptable for MVP; revisit if needed).

## Alternatives considered

- **Neo4j (graph)** — rejected for MVP: relationship complexity does not
  justify it; lacks the row-level tenant isolation model we want; adds a new
  operational surface.
- **ClickHouse (columnar/analytics)** — rejected for MVP: optimized for
  analytical scans, not our transactional, strongly-consistent, tenant-scoped
  workload. May be added later as a downstream analytics store if warranted.
- **Application-only tenant filtering (no RLS)** — rejected: a single missed
  `WHERE tenant_id` could cause a cross-tenant breach; no database backstop.
