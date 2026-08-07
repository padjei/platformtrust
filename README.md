# PlatformTrust

PlatformTrust is a multi-tenant **AI Trust Operations Platform**. It helps
organizations operate AI responsibly across its full lifecycle:

- **Assess AI readiness** across data, security, governance, infrastructure, and
  operational domains.
- **Identify gaps** and explain their business impact.
- **Create remediation roadmaps** with prioritized, actionable steps.
- **Convert approved readiness controls into continuous monitors.**
- **Detect failures and drift** after go-live.
- **Support approval-based remediation** with a human in the loop.

The platform is **cloud-neutral, application-neutral, and model-neutral**.
Salesforce is an _initial connector_, not a dependency.

> **Current milestone:** AI Readiness Auditor MVP.

## Core principles

- Every tenant-owned record carries a `tenant_id`. Tenant isolation is enforced
  in the API **and** in PostgreSQL via Row-Level Security (RLS).
- Authorization is **deny-by-default** and enforced server-side.
- UUIDs for all public/internal IDs; UTC for all persisted timestamps.
- All schema changes ship as migrations.
- **Readiness scoring is deterministic.** LLM output never decides pass/fail,
  authorization, compliance status, or risk scores; machine-readable AI output is
  schema-validated.
- Production remediation requires **human approval**.
- Default connector permissions are **read-only**.
- Every privileged action produces an audit event.

## Repository structure

This is a [pnpm workspace](https://pnpm.io/workspaces) monorepo orchestrated with
[Turborepo](https://turbo.build/).

```text
platformtrust/
├── apps/
│   ├── web/            # Next.js frontend (React, TypeScript, Tailwind, shadcn/ui)
│   ├── api/            # NestJS backend API (primary backend)
│   ├── worker/         # NestJS standalone worker (background jobs, monitors, scans)
│   └── ai-service/     # Python 3.12 + FastAPI AI service (separate, model-neutral process)
├── packages/
│   ├── config/         # Shared build/lint/tsconfig and runtime config helpers
│   ├── shared/         # Shared TypeScript utilities and types
│   ├── auth/           # Authentication / authorization primitives
│   ├── database/       # Database access, schema, and migration tooling
│   ├── sdk/            # Internal SDK / client contracts
│   └── ui/             # Shared UI component library
├── infrastructure/     # Terraform, Docker, and deployment configuration
└── docs/               # Constitution, engineering handbook, ADRs, and design docs
```

> Some additional workspace packages (e.g. connector SDK, control library, event
> schema) may be present as the platform evolves; the list above covers the core
> layout.

Applications are independent deployables and must not import from one another;
shared code lives in `packages/*`. This boundary is enforced by
[`scripts/check-app-boundaries.mjs`](scripts/check-app-boundaries.mjs) (see
[`tests/architecture/README.md`](tests/architecture/README.md)).

## Prerequisites

- **Node.js 22** — the version is pinned in [`.nvmrc`](.nvmrc)
  (`nvm use` will select it).
- **pnpm 9** — enabled via [Corepack](https://nodejs.org/api/corepack.html); the
  exact version is pinned in `package.json` (`packageManager`).
- **Python 3.12** + **[uv](https://docs.astral.sh/uv/)** — required only for
  `apps/ai-service`.

Enable Corepack once:

```bash
corepack enable
```

## Installation

Install all JavaScript/TypeScript workspace dependencies from the repo root:

```bash
pnpm install
```

Install the AI service's Python dependencies:

```bash
cd apps/ai-service
uv sync
```

Copy the environment template and fill in local values (placeholders only in the
template — never commit real secrets):

```bash
cp .env.example .env
```

## Local development

Run all apps in dev mode via Turborepo:

```bash
pnpm dev
```

### Running individual services

- **Web** (`apps/web`): `pnpm --filter @platformtrust/web dev`
- **API** (`apps/api`): `pnpm --filter @platformtrust/api dev`
- **Worker** (`apps/worker`): `pnpm --filter @platformtrust/worker dev`
- **AI service** (`apps/ai-service`):
  ```bash
  cd apps/ai-service
  uv run uvicorn platformtrust_ai_service.main:app --reload
  ```

## Build

```bash
pnpm build
```

## Test

Run the full TypeScript test suite:

```bash
pnpm test
```

With coverage:

```bash
pnpm test:coverage
```

Run the AI service tests:

```bash
cd apps/ai-service
uv run pytest
```

## Health endpoints

| Service    | Health endpoint                                                                           |
| ---------- | ----------------------------------------------------------------------------------------- |
| web        | `GET /health`                                                                             |
| api        | `GET /api/v1/health`                                                                      |
| ai-service | `GET /api/v1/health`                                                                      |
| worker     | Internal health-state (no public HTTP endpoint; exposed via its process/monitoring hooks) |

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request. In short:

1. Every change is tracked by an issue.
2. Branch from `main` as `<type>/PT-###-slug`.
3. Use Conventional Commit messages.
4. Open a PR into `main` (direct pushes to `main` are prohibited).
5. All CI checks and the Definition of Done must pass.

## Key documentation

- Constitution — [`docs/constitution/PLATFORMTRUST_CONSTITUTION.md`](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)
- Engineering handbook — [`docs/handbook/ENGINEERING_HANDBOOK.md`](docs/handbook/ENGINEERING_HANDBOOK.md)
- Architecture decision records — [`docs/adr/`](docs/adr/)
- Security policy — [`SECURITY.md`](SECURITY.md)

## License

Released under the [MIT License](LICENSE).
