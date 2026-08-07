# ADR-0001 — Use a PlatformTrust Monorepo (pnpm workspaces + Turborepo)

## Status

Accepted — 2026-08-07. Ratified under PT-001 (Bootstrap PlatformTrust Enterprise
Monorepo) with architecture review.

## Context

PlatformTrust comprises several cooperating runtime processes — a web frontend, a
primary API, a background worker, and a separate AI service — plus shared code
(types, auth contracts, an API client SDK, UI primitives, configuration). The
Engineering Handbook (§5, "Repository Structure") already prescribes a single
repository laid out as `apps/{web,api,worker,ai-service}`,
`packages/{ui,auth,database,sdk,shared}`, `infrastructure/`, and `docs/`. PT-001
requires bootstrapping that structure with reproducible builds, shared quality
gates, and CI.

We need a repository and build strategy that:

- keeps the platform "one coherent product" (Constitution Article IX) rather than
  a sprawl of independently versioned repositories;
- lets shared code be consumed through explicit package boundaries with
  one-directional dependencies (`.claude/rules/architecture.md`);
- supports independent build/test/deploy of each application without allowing one
  application to import another application's internal source (Handbook §5; NFR-008);
- gives fast, cacheable, dependency-ordered builds across a mixed
  TypeScript + Python codebase;
- pins tool and dependency versions for reproducibility (NFR-002).

The alternative of many small repositories (polyrepo) was considered and rejected
below.

## Decision

Adopt a **single monorepo** managed with:

- **pnpm workspaces** for JavaScript/TypeScript dependency management, with the
  workspace covering `apps/*` and `packages/*` (`pnpm-workspace.yaml`).
- **Turborepo** as the task runner for `build`, `dev`, `lint`, `typecheck`,
  `test`, `test:coverage`, and `clean`, with dependency-ordered builds and
  caching (development tasks are never cached).
- **Shared packages under `/packages`** (`@platformtrust/*`) as the only
  sanctioned mechanism for cross-application code reuse. Applications MUST NOT
  import another application's source directly; shared code flows one direction:
  apps depend on packages, never the reverse, and packages avoid circular
  dependencies.
- **Independently buildable and testable applications** under `/apps`. "Independent"
  here means each app can be built, tested, and run as its own process and is
  deployable on its own cadence — it does **not** mean a microservices
  architecture. The backend remains a modular monolith (see ADR-0002); the
  monorepo simply also houses the frontend, the worker process, and the separate
  AI service.
- The Python **AI service** lives inside the workspace directory tree
  (`apps/ai-service`) but manages its Python dependencies through **uv**
  (`pyproject.toml` + `uv.lock`), not pnpm.
- Version pinning via `.nvmrc` (Node 22 LTS), a pinned pnpm version through
  `packageManager`/Corepack, and lockfiles (`pnpm-lock.yaml`, `uv.lock`).

The repository keeps the existing approved documents (Constitution, Engineering
Handbook) unchanged and adds ADRs under `docs/adr/`.

## Alternatives Considered

1. **Polyrepo (one repository per app/package).** Rejected: fragments a product
   that must stay "one coherent product" (Constitution Article IX), complicates
   atomic cross-cutting changes and shared-package versioning, and multiplies CI,
   dependency, and secret-scanning surface. Handbook §5 already mandates a single
   repository structure.
2. **npm or Yarn workspaces instead of pnpm.** Rejected: pnpm's content-addressed
   store gives faster, disk-efficient, strict installs and first-class workspace
   protocols. The Handbook/ratified tooling and PT-001 both specify pnpm.
3. **Nx instead of Turborepo.** Rejected for this bootstrap: Turborepo is a
   lighter task/cache layer that satisfies PT-001's requirements (dependency-ordered
   cached builds) without imposing a heavier generator/plugin framework. Revisit
   only if project-graph tooling becomes necessary.
4. **A single unified TypeScript-only or Python-only stack.** Rejected: the
   product genuinely needs both (see ADR-0002); the monorepo accommodates both
   toolchains side by side (pnpm + uv).

## Consequences

Positive:

- One coherent product with atomic cross-package changes and a single CI surface.
- Enforceable package boundaries and one-directional dependencies.
- Fast, cached, dependency-ordered builds; reproducible via pinned versions and
  lockfiles.
- A single place for shared quality gates (lint, format, typecheck, test) and
  documentation.

Negative / trade-offs:

- Larger checkout and a more complex root configuration than a single app.
- Requires discipline (and an automated check) to prevent cross-application source
  imports (NFR-008) — added as an architecture/lint test under PT-001.
- Two package managers coexist (pnpm for TS, uv for Python); contributors must
  learn both entry points.
- Turborepo remote caching is not configured in this issue; only local caching
  applies for now.

## Security Impact

- A single repository centralizes secret scanning, dependency scanning, and
  branch protection (Constitution Article XX). No secrets are introduced; only
  `.env.example` placeholders are committed (Article XIX).
- CI uses least-privilege, read-only-by-default permissions (PT-001 security
  requirements). Lockfiles and pinned versions reduce supply-chain risk (NFR-002).
- Package boundaries reduce blast radius: the AI service and its dependencies are
  isolated from the authoritative backend (elaborated in ADR-0002).

## Operational Impact

- Standard developer entry points via root scripts and Turborepo tasks; a clean
  clone must install and build with documented commands (NFR-001).
- CI runs on pull requests targeting `main` and on pushes to `main`, with pnpm and
  uv dependency caching. No deployment occurs from CI under this issue.
- `main` remains deployable; direct pushes to `main` are prohibited (Handbook §11).

## Migration Impact

- No production system exists yet; this is a greenfield bootstrap, so there is no
  data or runtime migration.
- Pre-existing scaffold directories from earlier exploratory work are reconciled
  to the Handbook §5 structure under PT-001 without deleting the ratified
  Constitution or Engineering Handbook.
- Any future addition of a new top-level directory requires architecture approval
  (Handbook §5).

## References

- GitHub issue PT-001 — Bootstrap PlatformTrust Enterprise Monorepo (FR-001–FR-003,
  Architecture Constraints, NFR-001/002/008).
- `docs/handbook/ENGINEERING_HANDBOOK.md` §5 (Repository Structure), §10 (ADRs),
  §11 (Branching), §13 (Pull Requests).
- `docs/constitution/PLATFORMTRUST_CONSTITUTION.md` Article IX (One coherent
  product), Article XIX (Infrastructure/secrets), Article XX (Supply chain).
- `.claude/rules/architecture.md` (module boundaries, one-directional dependencies).
- ADR-0002 — Initial Application Technology Stack.
