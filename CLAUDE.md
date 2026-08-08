# PlatformTrust — Claude Code Operating Guide

This file tells implementation agents (Claude Code) **how to work** in this
repository. It is an operating guide, **not** a product or architecture source of
truth, and it does not itself approve any product behavior, technology, or
provider.

Authoritative sources, in precedence order (highest first). When they conflict,
**surface the conflict — do not silently resolve it**:

1. Applicable law and regulatory requirements.
2. [PlatformTrust Constitution](docs/constitution/PLATFORMTRUST_CONSTITUTION.md).
3. Approved security and privacy requirements.
4. **Accepted** Architecture Decision Records in [`docs/adr/`](docs/adr/).
5. [Engineering Handbook](docs/handbook/ENGINEERING_HANDBOOK.md).
6. Engineering standards in [`docs/standards/`](docs/standards/README.md).
7. Approved PRDs / epics.
8. Approved implementation tickets.
9. Implementation preferences.

## Before you change anything

Read, in order:

1. The [Constitution](docs/constitution/PLATFORMTRUST_CONSTITUTION.md).
2. The [Engineering Handbook](docs/handbook/ENGINEERING_HANDBOOK.md).
3. The **Accepted** ADRs in [`docs/adr/`](docs/adr/). Treat any ADR whose status
   is **Proposed** as a proposal only — **not** approved architecture.
4. The relevant [engineering standards](docs/standards/README.md).
5. The complete implementation issue — every acceptance criterion and every
   linked document, not just the title or summary.
6. The current implementation, before proposing changes.

## Operating rules

- **Report conflicts rather than inventing behavior.** If a requirement is
  ambiguous, or would require inventing product behavior, permissions, data
  schemas, API contracts, tenant rules, AI authority, or UX, stop and report it
  instead of guessing (Constitution §3.3).
- **Do not invent or select** product behavior, architecture, or technologies
  that are not established by an authoritative source above.
- **Technology choices not yet ratified by an Accepted ADR are deferred** — do
  not select a database, ORM, authentication/identity provider, cloud provider,
  secret manager, queue/message broker, AI model/provider, vector database, or
  observability/logging vendor.
- **Do not self-approve architecture.** You may author an ADR **proposal**, but
  you must not declare your own proposed ADR Accepted; architecture and security
  approval is performed by designated human reviewers.
- Make **no unrelated changes**; keep the diff scoped to the issue.
- **Never commit** secrets, credentials, tokens, private keys, PII, or customer
  data — in source, logs, tests, fixtures, or prompts.

## Invariants to preserve

Every change must preserve these constitutional invariants:

- **Multi-tenancy** — tenant isolation is mandatory and enforced server-side;
  frontend filtering is never an isolation control. The persistence-layer
  mechanism is deferred to a future data ADR.
- **Deny-by-default authorization** — access is denied unless explicitly granted,
  enforced server-side; client-supplied identity/tenant is never trusted.
- **Auditability** — privileged/state-changing actions produce durable audit
  events.
- **Accessibility** — user-facing changes meet WCAG 2.2 AA expectations.
- **Testability** — new behavior ships with tests, including tenant-isolation and
  authorization-failure coverage where applicable.
- **Observability** — structured logging and surfaced errors, with no secrets or
  sensitive data.
- **AI authority** — AI is advisory by default; humans retain authority over
  high-impact decisions, and AI output is not treated as verified system fact
  (see [AI Engineering Standard](docs/standards/AI_ENGINEERING_STANDARD.md)).

## Approved application stack

Ratified by [ADR-0001](docs/adr/ADR-0001-use-platformtrust-monorepo.md) (monorepo)
and [ADR-0002](docs/adr/ADR-0002-initial-application-technology-stack.md) (stack):

- **Monorepo** — pnpm workspaces + Turborepo (Node 22, pnpm 9).
- **Web** — Next.js + TypeScript (`apps/web`).
- **API** — NestJS + TypeScript (`apps/api`); the authoritative HTTP/API process.
- **Worker** — NestJS standalone (`apps/worker`).
- **AI service** — FastAPI + Python 3.12 via uv (`apps/ai-service`).
- **Shared packages** — `packages/{config,shared,auth,database,sdk,ui}`.

Applications must not import another application's source; shared code lives in
`packages/*` (enforced by
[`scripts/check-app-boundaries.mjs`](scripts/check-app-boundaries.mjs)).

Data storage, cloud/hosting, secret management, identity, queueing, and
AI-provider technologies are **not selected** in the repository yet and are
deferred to future ADRs.

## Validation commands

There is no `make` target. Use the repository toolchain. From the repository root:

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `node scripts/check-app-boundaries.mjs`

From `apps/ai-service`:

- `uv sync --frozen`
- `uv run ruff check .`
- `uv run ruff format --check .`
- `uv run mypy .`
- `uv run pytest`

Run every applicable check before declaring work complete. If a command is
missing or broken, report it and fix the repository tooling rather than silently
bypassing it.

## Git and pull requests

- `main` is protected and deployable. **Never push directly to `main`.**
- Branch as `<type>/PT-###-slug`; use Conventional Commits (enforced by
  Commitlint). Squash-merge is preferred.
- Open a pull request into `main` with scope matched to the issue. See the
  [Git Standard](docs/standards/GIT_STANDARD.md) and
  [Pull Request Standard](docs/standards/PULL_REQUEST_STANDARD.md).

## Definition of Done

Follow the [Definition of Done](docs/standards/DEFINITION_OF_DONE.md).

**Always required:** acceptance criteria met; required tests pass; lint, type,
and static checks pass; no secrets committed; documentation current; no
unresolved critical/high findings; scope respected.

**Conditionally required** (only when the change touches that concern):
authorization tests; tenant-isolation tests; database migration; audit events;
accessibility validation; performance validation; AI evaluations; rollback plan;
security review; an ADR.

## Governance and standards index

- Constitution — [`docs/constitution/PLATFORMTRUST_CONSTITUTION.md`](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)
- Engineering Handbook — [`docs/handbook/ENGINEERING_HANDBOOK.md`](docs/handbook/ENGINEERING_HANDBOOK.md)
- Architecture Decision Records — [`docs/adr/`](docs/adr/)
- Engineering standards — [`docs/standards/README.md`](docs/standards/README.md)
- Standards enforcement matrix — [`docs/standards/ENFORCEMENT_MATRIX.md`](docs/standards/ENFORCEMENT_MATRIX.md)
