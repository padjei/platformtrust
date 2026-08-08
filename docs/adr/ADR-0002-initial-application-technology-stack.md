# ADR-0002 — Initial Application Technology Stack

## Status

Accepted — 2026-08-07. Ratified under PT-001 with architecture review.

**This ADR supersedes the "Approved Stack → Backend" entry in `CLAUDE.md`** (which
previously named a Python/FastAPI-based stack as the primary backend).
Per the Constitution's precedence order (§2), an Accepted ADR outranks the
engineering standards in `CLAUDE.md`. This supersession is explicit, not silent
(Constitution §6), was approved through architecture review (the
`needs-architecture-review` gate on PT-001), and `CLAUDE.md` is updated in the same
change set to point here.

## Context

PlatformTrust needs an initial, foundational technology stack for four processes:
a web frontend, a primary API, a background worker, and a separate AI service. Two
sources bear on this decision and they conflicted:

- **PT-001** (the implementation ticket) specifies **Next.js** (web), **NestJS**
  (API), **NestJS standalone** (worker), and **FastAPI/Python 3.12** (AI service).
- The pre-existing engineering standards in **`CLAUDE.md`** named **Python/FastAPI**
  as the *primary* backend and framed the system as a modular monolith, with no
  Node/NestJS backend approved.

Under the Constitution's precedence order (Law > Constitution > Security > **Accepted
ADRs** > Handbook > **Engineering standards** > PRDs > **Tickets**), the PT-001
ticket alone cannot override `CLAUDE.md`; only an Accepted ADR with architecture
approval can. This ADR records that decision and reconciliation rather than letting
the bootstrap silently contradict a ratified standard.

The AI service is deliberately separated from the primary API. The ratified corpus
strongly supports this: AI must fail safely without compromising tenant isolation
or user authority (Constitution Article XIII); LLM output must never determine
control pass/fail, authorization, compliance status, production changes, or final
risk scores, and scoring stays deterministic (Constitution Article X; `CLAUDE.md`;
`.claude/rules/ai-safety.md`); the platform must stay model-neutral with a
provider abstraction.

## Decision

Adopt the following initial stack:

- **Web — `apps/web`:** Next.js (App Router) + TypeScript. A minimal landing shell
  and a machine-readable `/health` route. No auth, dashboards, mock data, database,
  or analytics under this issue.
- **API — `apps/api`:** **NestJS** + TypeScript. Global prefix `/api`, versioned
  under `/api/v1`, `GET /api/v1/health`, request/correlation-ID middleware,
  centralized exception handling, environment-config validation, graceful shutdown,
  structured logging. Implemented as a **modular monolith** (domain modules with
  explicit, one-directional boundaries) — not microservices.
- **Worker — `apps/worker`:** **NestJS standalone** (no HTTP server). Structured
  startup logging, graceful shutdown, env-config validation, and a unit-testable
  internal health-state function. No queue provider, scheduled jobs, or database.
- **AI service — `apps/ai-service`:** **FastAPI + Python 3.12**, managed with **uv**.
  `GET /api/v1/health`, structured JSON logging, env-config validation, version
  metadata. No model provider SDK, embeddings, vector DB, or prompts under this
  issue. Kept as a **separate process/deployable** from the authoritative API.
- **Shared TypeScript config:** a strict root `tsconfig.base.json` (strict,
  `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`,
  `forceConsistentCasingInFileNames`, `useUnknownInCatchVariables`,
  `exactOptionalPropertyTypes`, `noEmit`).
- **Quality tooling:** ESLint, Prettier, `tsc`, Vitest (TS tests), Pytest, Ruff,
  MyPy, Husky, lint-staged, Commitlint (Conventional Commits).

Scope guardrails (unchanged by this ADR): no database/ORM, no auth provider, no
queue, no AI model provider, no cloud runtime dependencies, and no customer-facing
features beyond health endpoints and default shells (PT-001 Architecture
Constraints and Out of Scope).

## Alternatives Considered

1. **Keep FastAPI/Python as the primary backend (honor `CLAUDE.md` as-is), AI
   service also FastAPI.** Viable and lower-conflict, but rejected by architecture
   review in favor of a TypeScript/NestJS API to share language, types, tooling,
   and the `@platformtrust/*` packages with the web frontend and worker, reducing
   context-switching and enabling end-to-end type sharing. Recorded here because it
   was the incumbent ratified position.
2. **Express/Fastify instead of NestJS for the API/worker.** Rejected: NestJS
   provides a batteries-included, modular, DI-based structure that maps cleanly to
   the modular-monolith requirement and to a standalone worker, with less bespoke
   wiring.
3. **A single Node service hosting both API and AI logic.** Rejected: violates the
   AI-safety separation (Constitution Articles X, XIII) and model-neutrality goals;
   Python/FastAPI is also the pragmatic ecosystem for future AI/ML work. Hence the
   AI service stays a separate Python process.
4. **Next.js API routes as the backend (no separate API app).** Rejected: couples
   backend lifecycle to the frontend, weakens the API-as-versioned-contract
   principle (Constitution Article VIII), and blocks independent scaling/deployment
   of the API and worker.

## Consequences

Positive:

- Shared TypeScript language, types, tooling, and packages across web, API, and
  worker; strong end-to-end typing.
- Clear separation between the deterministic, authoritative API and the
  probabilistic AI service, limiting AI blast radius and easing model-provider
  changes.
- NestJS's modular structure directly supports the modular-monolith mandate.

Negative / trade-offs:

- **Changes a ratified standard.** `CLAUDE.md`'s backend entry and any documents
  that assumed a Python/FastAPI primary backend must be reconciled (done in this
  change set). Contributors must be aware NestJS is now the primary API.
- Two backend runtimes (Node/TS and Python) increase the toolchain surface and CI
  matrix.
- Database and ORM selection are out of scope for this decision and remain
  deferred to a future ADR.

## Security Impact

- Separating the AI service isolates model-provider dependencies and probabilistic
  behavior from the authoritative API and any future authorization/scoring paths
  (Constitution Articles X, XIII; `.claude/rules/ai-safety.md`).
- All services validate environment configuration and fail fast; health endpoints
  expose no secrets, host details, credentials, stack traces, or internal config
  (PT-001 Security Requirements; Constitution Article XVII).
- Error handlers must not return raw stack traces in production. No secrets are
  committed; only `.env.example` placeholders (Constitution Article XIX).
- Placeholder auth types (in `@platformtrust/auth`) must not imply that access
  control is implemented (PT-001 Security Requirement 8).

## Operational Impact

- CI must build and test both the TS applications/packages and the Python AI
  service (Node 22 + pnpm; Python 3.12 + uv), with dependency caching and
  least-privilege permissions. No deployment occurs from CI under this issue.
- Each application is independently buildable/testable and must expose or implement
  health behavior; each needs a documented owner (Constitution Article XXIII —
  "unowned production services are prohibited"), tracked via CODEOWNERS.
- Observability: services emit structured startup and failure information (NFR-007).

## Migration Impact

- Greenfield: no runtime or data migration. This ADR migrates the *documented
  standard* — `CLAUDE.md`'s "Approved Stack → Backend" is updated to reference this
  ADR and reflect NestJS as the primary API with FastAPI scoped to the AI service.
- Earlier `docs/decisions/` ADRs remain in the repository as history; this ADR
  changes only the backend framework, not the modular-monolith architecture style,
  and does not decide database or cloud technology.
- Database, ORM, secret-management, and cloud selection are out of scope for this
  ADR and remain deferred to future ADRs.

## References

- GitHub issue PT-001 — FR-005–FR-010, FR-013, Architecture Constraints, Security
  Requirements, Out of Scope.
- `docs/constitution/PLATFORMTRUST_CONSTITUTION.md` §2 (Authority and Precedence),
  §6 (no silent exceptions), Article VIII (API contracts), Article X (Explainable
  AI), Article XIII (AI fails safely), Article XXIII (service ownership).
- `docs/handbook/ENGINEERING_HANDBOOK.md` §5 (Repository Structure), §10 (ADRs),
  §37 (Dependencies).
- `CLAUDE.md` — Approved Stack (superseded backend entry), Architecture Rules.
- ADR-0001 — Use a PlatformTrust Monorepo.
