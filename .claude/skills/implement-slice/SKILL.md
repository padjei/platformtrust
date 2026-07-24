---
name: implement-slice
description: Implement the smallest complete vertical slice for an AI PlatformTrust feature, with tests, honoring tenancy, security, and AI-safety rules. Use after a plan exists.
---

# Implement a Vertical Slice

Deliver one thin, end-to-end, tested slice rather than a broad,
untested change.
Database → API → Authorization → UI → Tests → Documentation

## Preconditions
- A plan exists (see `plan-feature`) and the target slice is identified.
- You have read `.claude/rules/` for the affected domains.

## Steps

1. **Scope the slice.** Confirm the single smallest path that delivers value and
   satisfies an AC. Resist expanding scope.
2. **Database + migration (if needed).** Create a new Alembic migration
   (see `create-migration`): `tenant_id NOT NULL`, RLS enabled + policy, UUID PK,
   `timestamptz` UTC, indexes. Never edit a committed migration.
3. **Backend.** Add Pydantic request/response models, service logic, and
   repository/data access. Derive `tenant_id` from auth context (never client
   input). Enforce authz server-side. Emit audit events for privileged actions.
   Keep scoring deterministic; validate any AI output against a schema.
4. **Frontend.** Build UI with shadcn/ui; use TanStack Query for server state and
   React Hook Form + Zod for forms. Validate API responses with Zod. Keep TS strict.
   No credentials/secrets in the browser.
5. **Tests.** Add unit tests (logic/scoring), integration tests with Testcontainers
   including a **tenant-isolation** test, and e2e (Playwright) for the flow. Cover
   malformed/untrusted input.
6. **Verify quality gates.** Run Ruff, mypy, ESLint, TS compile, and the test suite.
   Do not disable or weaken tests to pass.
7. **Self-review.** Check the diff against `security-review` criteria before handing off.

## Definition of Done for the slice
End-to-end path works, tenancy enforced (API + RLS), tests green, lint/type-check
clean, audit + AI-safety rules satisfied, migration reversible.
