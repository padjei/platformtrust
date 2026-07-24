# ADR-001: Start as a Modular Monolith

**Status:** Accepted

## Context

AI PlatformTrust's current milestone is the AI Readiness Auditor MVP — a
multi-tenant platform assessing AI readiness, producing gaps and remediation
roadmaps. The team is small and the domain model (assessments, controls,
scoring, evidence, connectors) is still evolving. We must move quickly while
keeping strong security guarantees, especially tenant isolation (see
[`../security/TENANT_ISOLATION.md`](../security/TENANT_ISOLATION.md)).

Microservices would add distributed-systems overhead — network boundaries,
independent deployments, cross-service auth, data consistency, and
observability — that slows a small team and multiplies the places where tenant
isolation and authorization must be enforced.

## Decision

Build the MVP as a **modular monolith**: a single deployable FastAPI
application (on Azure Container Apps) organized into clearly bounded internal
modules (e.g., assessments, controls/scoring, evidence, connectors, identity/
tenancy, audit). Modules communicate through explicit in-process interfaces,
not by reaching into each other's internals or databases. All modules share
one PostgreSQL database with Row-Level Security for tenant isolation (see
[`ADR-002-postgresql.md`](./ADR-002-postgresql.md)).

Module boundaries are drawn so that a future extraction into services is
possible if scale demands it, but is not done prematurely.

## Consequences

**Positive**
- Faster development and simpler local dev, testing, and deployment.
- Tenant isolation and authorization enforced in one place, consistently.
- One transaction boundary simplifies data consistency (e.g., result + audit).
- Easier end-to-end reasoning about the threat model.

**Negative / trade-offs**
- Whole app scales as a unit (mitigated by Container Apps autoscaling for MVP
  load).
- Requires discipline to keep module boundaries clean and avoid a "big ball of
  mud"; enforced via code review.
- A future service extraction is deferred work if/when needed.

## Alternatives considered

- **Microservices from day one** — rejected: operational and security overhead
  not justified for MVP scale and team size; multiplies isolation enforcement
  points.
- **Unstructured monolith** — rejected: would erode boundaries and make future
  extraction and reasoning about security harder.
- **Serverless functions** — rejected for the core app: harder to maintain
  consistent tenant-scoped DB sessions and RLS context; better suited to
  isolated async tasks later.
