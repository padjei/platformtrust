# AI PlatformTrust

AI PlatformTrust is a multi-tenant **AI Trust Operations Platform**. It helps
organizations operate AI responsibly across its full lifecycle:

- **Assess AI readiness** across data, security, governance, infrastructure, and
  operational domains.
- **Identify gaps** and their business impact.
- **Create remediation roadmaps** with prioritized, actionable steps.
- **Convert approved readiness controls into continuous monitors.**
- **Detect failures and drift** after go-live.
- **Explain business impact** and support **approval-based remediation**.

The platform is **cloud-neutral, application-neutral, and model-neutral**.
Salesforce is an *initial connector*, not a dependency. Any connector can be
added without changing the core.

> **Current milestone:** AI Readiness Auditor MVP.
> See [`docs/product/MVP_SCOPE.md`](docs/product/MVP_SCOPE.md).

## Core principles

- Every tenant-owned record carries a `tenant_id`. Tenant isolation is enforced
  in the API **and** in PostgreSQL via Row-Level Security (RLS).
- UUIDs for all IDs; UTC for all timestamps.
- All schema changes ship as migrations (Alembic).
- **Readiness scoring is deterministic.** LLM output never decides
  pass/fail, authorization, compliance status, or risk scores.
- Production remediation requires **human approval**.
- Default connector permissions are **read-only**.

## Tech stack

| Layer     | Technologies |
|-----------|--------------|
| Frontend  | Next.js, React, TypeScript, Tailwind, shadcn/ui, TanStack Query, React Hook Form, Zod |
| Backend   | Python, FastAPI, Pydantic, SQLAlchemy, Alembic |
| Data      | PostgreSQL + Row-Level Security, Azure Blob Storage (evidence), Redis (when justified) |
| Infra     | Docker, Azure Container Apps, Azure Database for PostgreSQL, Azure Key Vault, Terraform, GitHub Actions |
| Testing   | Pytest, Playwright, Testcontainers, Ruff, mypy, ESLint, TypeScript strict |

Architecture is a **modular monolith**.

## Monorepo layout

```
platformtrust/
├── apps/
│   └── web/            # Next.js frontend (React, TypeScript, Tailwind, shadcn/ui)
├── services/
│   ├── api/            # FastAPI backend (Pydantic, SQLAlchemy, Alembic)
│   └── worker/         # Background jobs: monitors, drift detection, scans
├── packages/           # Shared internal libraries (types, schemas, utilities)
├── connectors/         # Pluggable, read-only-by-default integrations (e.g. Salesforce)
├── docs/               # Product, architecture, and security documentation
└── infrastructure/     # Terraform, Docker, and deployment configuration
```

## Quickstart

Requirements: Docker + Docker Compose, `make`, Python 3.12+, Node 20+.

```bash
# 1. One-time local setup (installs API + web dependencies, seeds config)
make setup

# 2. Bring up the full stack (postgres, api, web) via docker compose
make dev
```

Then open:

- Web app: <http://localhost:3000>
- API docs: <http://localhost:8000/docs>

Copy `.env.example` to `.env` and fill in placeholders before running:

```bash
cp .env.example .env
```

Run `make help` to see all available commands.

## Key documentation

- Product / MVP scope — [`docs/product/MVP_SCOPE.md`](docs/product/MVP_SCOPE.md)
- System architecture — [`docs/architecture/SYSTEM_ARCHITECTURE.md`](docs/architecture/SYSTEM_ARCHITECTURE.md)
- Threat model — [`docs/security/THREAT_MODEL.md`](docs/security/THREAT_MODEL.md)

## Contributing & security

- Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.
- Read [`SECURITY.md`](SECURITY.md) to report a vulnerability or understand our
  security posture.

## License

Released under the [MIT License](LICENSE).
