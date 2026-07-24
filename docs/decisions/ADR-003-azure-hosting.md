# ADR-003: Azure Hosting with Cloud-Neutral Design

**Status:** Accepted

## Context

AI PlatformTrust needs a hosting platform for the MVP that provides managed
compute, a managed PostgreSQL database, secret management, and object storage
for evidence, with good security defaults and low operational burden for a
small team.

At the same time, a core product principle is that the platform is
**cloud/app/model-neutral** — customers should not perceive a hard dependency
on any single cloud, and we want the option to run elsewhere in the future.
These two needs are in tension: use managed cloud services for speed, but avoid
deep lock-in in the design.

## Decision

Host the MVP on **Microsoft Azure**, using:

- **Azure Container Apps** — run the containerized FastAPI modular monolith
  (see [`ADR-001-modular-monolith.md`](./ADR-001-modular-monolith.md)) with
  autoscaling.
- **Azure Database for PostgreSQL** — managed PostgreSQL with RLS (see
  [`ADR-002-postgresql.md`](./ADR-002-postgresql.md)).
- **Azure Key Vault** — secret storage, accessed via managed identity (see
  [`../security/SECURE_SDLC.md`](../security/SECURE_SDLC.md)).
- **Azure Blob Storage** — encrypted evidence storage in tenant-partitioned
  paths (see
  [`../security/DATA_CLASSIFICATION.md`](../security/DATA_CLASSIFICATION.md)).

To preserve neutrality, we **isolate cloud-specific concerns behind
interfaces**: object storage, secret retrieval, and identity are accessed
through internal abstractions rather than sprinkling SDK calls throughout the
code. Infrastructure is defined in **Terraform**, deployed via **GitHub
Actions**, and the app is containerized with **Docker** so it is portable.

## Consequences

**Positive**
- Managed services reduce operational burden and provide strong security
  defaults (managed identity, encryption at rest, private networking options).
- Containerization + Terraform keep the deployment reproducible and portable.
- Abstractions keep the door open to another cloud or on-prem later.

**Negative / trade-offs**
- Some Azure-specific integration remains (managed identity, Key Vault, Blob),
  concentrated behind abstractions but not zero.
- Neutrality requires ongoing discipline to avoid leaking provider specifics
  into core modules; enforced in review.
- Portability is designed-for, not continuously proven, unless we test on a
  second target.

## Alternatives considered

- **AWS / GCP** — comparable capability; Azure chosen for team/ecosystem fit.
  Neutral design keeps a future move feasible.
- **Kubernetes (AKS) instead of Container Apps** — rejected for MVP: more
  operational overhead than needed at current scale; Container Apps gives
  autoscaling with less to manage.
- **Self-managed VMs / on-prem** — rejected: higher operational and security
  burden; managed services are safer and faster for the MVP.
- **Cloud-agnostic-only (no managed services)** — rejected: would sacrifice
  speed and managed security for a portability we do not yet need in practice.
