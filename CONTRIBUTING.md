# Contributing to AI PlatformTrust

Thank you for contributing. This document defines the workflow, standards, and
Definition of Done for changes to AI PlatformTrust. Following it keeps the
platform secure, tenant-isolated, and consistent with our core principles.

Before starting, make sure you understand the product invariants in the
[`README.md`](README.md), especially: tenant isolation via `tenant_id` + RLS,
deterministic scoring, LLM output never decides pass/fail or authorization,
human-approved production remediation, and read-only-by-default connectors.

## Per-issue workflow (10 steps)

Follow these steps in order for **every** issue:

1. **Read the issue, acceptance criteria (ACs), and relevant ADRs.** Understand
   what "done" means before writing any code. If ACs are ambiguous, ask.
2. **Inspect the existing implementation.** Search the codebase for related
   modules, models, endpoints, and components. Reuse before you rebuild.
3. **Write a plan.** A short, ordered description of the change you intend to
   make. Post it on the issue when the change is non-trivial.
4. **Identify impact across every layer:** database (models + migrations), API
   (routes, schemas, permissions), UI, security (authz, tenancy, secrets),
   testing, and migrations. Note each explicitly.
5. **Build the smallest complete vertical slice.** Deliver end-to-end value
   (DB → API → UI where applicable) rather than a partial horizontal layer.
6. **Add or update tests.** New behavior must be covered by tests at the
   appropriate level (unit, integration, e2e). Include tenant-isolation tests
   for any tenant-owned data.
7. **Run validation.** `make verify` must pass locally (lint, typecheck, test,
   security-check) before you request review.
8. **Review your own diff** for security, tenancy, and scope: no leaked secrets,
   every tenant-owned query is scoped, no changes outside the issue's scope.
9. **Update documentation.** Keep `docs/`, ADRs, README, and inline docstrings
   consistent with the change.
10. **No unrelated refactoring.** Keep the diff focused on the issue. Open a
    separate issue for opportunistic cleanups.

## Branching & pull requests

- **Never push directly to `main`.** `main` is protected.
- Create a feature branch from `main`, e.g.
  `feat/<issue-number>-short-description` or `fix/<issue-number>-...`.
- Open a **pull request** targeting `main`. PRs require passing CI and review.
- Keep PRs small and scoped to a single issue.
- Reference the issue number in the PR description.

## Required commands

Run these before pushing:

```bash
make lint            # Ruff (api) + ESLint (web)
make typecheck       # mypy (api) + tsc --noEmit (web)
make test            # unit tests (pytest + web unit tests)
make test-integration# integration tests (Testcontainers)
make security-check  # dependency + secret scanning
make verify          # lint + typecheck + test + security-check
```

## Definition of Done

A change is done only when **all** of the following are true:

- [ ] Acceptance criteria are met.
- [ ] Smallest complete vertical slice is delivered (no dangling half-layers).
- [ ] Database changes ship with an Alembic migration (up **and** down).
- [ ] Every tenant-owned record has `tenant_id`; every query is tenant-scoped
      and covered by RLS.
- [ ] UUIDs used for IDs; timestamps stored in UTC.
- [ ] Readiness scoring remains deterministic; LLM output does not decide
      pass/fail, authorization, compliance, or risk scores.
- [ ] Production remediation paths require human approval.
- [ ] New connectors default to read-only permissions.
- [ ] Tests added/updated and passing, including tenant-isolation coverage.
- [ ] `make verify` passes locally.
- [ ] Documentation and ADRs updated.
- [ ] No secrets, PII, or customer data committed.
- [ ] Diff reviewed for security, tenancy, and scope.

## Prohibited shortcuts

- Do **not** disable, bypass, or weaken PostgreSQL RLS.
- Do **not** skip migrations by mutating the schema manually.
- Do **not** let LLM output determine pass/fail, authorization, compliance
  status, or risk scores.
- Do **not** auto-apply remediation in production without human approval.
- Do **not** commit secrets, credentials, PII, or customer data.
- Do **not** widen connector permissions beyond what an issue requires; keep
  them read-only unless explicitly justified and approved.
- Do **not** merge with failing tests, skipped validation, or `# type: ignore`
  / lint suppressions used to hide real problems.
- Do **not** bundle unrelated refactoring into a feature or fix PR.
