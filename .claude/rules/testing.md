# Testing Rules

Pytest + Playwright + Testcontainers. Tenancy and security paths must be covered.

## What to test
- **Do** unit-test deterministic scoring exhaustively (fixed inputs → fixed outputs).
- **Do** write **integration tests** against a real Postgres via **Testcontainers**,
  including RLS behavior.
- **Do** write **e2e tests** with **Playwright** for critical user flows
  (assessment, findings, remediation approval).
- **Do** add a regression test with every bug fix.

## Tenancy and security coverage
- **Do** explicitly test tenant isolation: tenant A must never read or write
  tenant B's data, at both the API and RLS layers.
- **Do** test that `tenant_id` cannot be spoofed via client input.
- **Do** test authorization failures (401/403) for privileged actions.
- **Don't** ship tenant-owned features without an isolation test.

## Discipline
- **Don't** disable, skip, `xfail`, or comment out tests to make a build pass.
- **Don't** weaken assertions to accommodate a bug — fix the code.
- **Do** keep tests deterministic (no real network, no wall-clock/random reliance,
  freeze time where needed).
- **Do** keep fixtures free of real secrets/PII; use synthetic data.

## Quality gates
- **Do** ensure Ruff, mypy, ESLint, and the TS compiler pass alongside tests.
- **Do** cover both connector happy-path parsing and malformed/untrusted payloads.
