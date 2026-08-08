# PlatformTrust

PlatformTrust is a multi-tenant enterprise platform. This repository is the
PlatformTrust monorepo; it contains the platform's applications, shared packages,
and supporting tooling.

Product behavior, architecture beyond the application stack, and any data, cloud,
or security implementation decisions are governed by the
[Constitution](docs/constitution/PLATFORMTRUST_CONSTITUTION.md), the
[Engineering Handbook](docs/handbook/ENGINEERING_HANDBOOK.md), and the
[Architecture Decision Records](docs/adr/) — not by this README.

## Approved application stack

Defined by [ADR-0002](docs/adr/ADR-0002-initial-application-technology-stack.md):

- **Next.js** — web frontend (`apps/web`)
- **NestJS** — primary API (`apps/api`) and standalone worker (`apps/worker`)
- **FastAPI (Python 3.12)** — separate AI service (`apps/ai-service`)
- **TypeScript** and **Python** as the implementation languages

Database, ORM, cloud, secret-management, and authentication technologies are
**not selected in this repository** and are deferred to future ADRs.

## Repository structure

This is a [pnpm workspace](https://pnpm.io/workspaces) monorepo orchestrated with
[Turborepo](https://turbo.build/). See
[ADR-0001](docs/adr/ADR-0001-use-platformtrust-monorepo.md).

```text
platformtrust/
├── apps/
│   ├── web/            # Next.js frontend (TypeScript)
│   ├── api/            # NestJS API (primary backend)
│   ├── worker/         # NestJS standalone worker
│   └── ai-service/     # FastAPI AI service (Python 3.12, separate process)
├── packages/
│   ├── config/         # Shared build/lint/tsconfig config helpers
│   ├── shared/         # Shared TypeScript utilities and types
│   ├── auth/           # Auth contract types (placeholder; no behavior)
│   ├── database/       # Database configuration boundary (placeholder)
│   ├── sdk/            # Internal client-contract types (placeholder)
│   └── ui/             # Shared UI component library
├── infrastructure/     # Infrastructure configuration
└── docs/               # Constitution, engineering handbook, ADRs, and design docs
```

Applications are independently buildable/testable and must not import from one
another; shared code lives in `packages/*`. This boundary is enforced by
[`scripts/check-app-boundaries.mjs`](scripts/check-app-boundaries.mjs) (see
[`tests/architecture/README.md`](tests/architecture/README.md)).

## Prerequisites

- **Node.js 22** — pinned in [`.nvmrc`](.nvmrc) (`nvm use` will select it).
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

Run the AI service tests:

```bash
cd apps/ai-service
uv run pytest
```

## Health endpoints

| Service    | Health endpoint                                          |
| ---------- | -------------------------------------------------------- |
| web        | `GET /health`                                            |
| api        | `GET /api/v1/health`                                     |
| ai-service | `GET /api/v1/health`                                     |
| worker     | Internal health-state function (no public HTTP endpoint) |

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
