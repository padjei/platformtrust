---
name: release-check
description: Run the Definition of Done and `make verify` before releasing AI PlatformTrust. Use as the final gate before merging or shipping a change.
---

# Release Check

Final gate before release. All checks must pass; do not bypass failures.

## Steps

1. **Run the full verification target.** `make verify` (or the project equivalent),
   which should run: Ruff, mypy, ESLint, TS compile, Pytest (incl. Testcontainers
   integration), and Playwright e2e.
2. **Confirm the Definition of Done:**
   - Acceptance criteria for the change are met.
   - Tenancy enforced at API and RLS layers; a tenant-isolation test exists and passes.
   - Authorization enforced server-side; privileged actions audited.
   - Migrations are new (no edits to committed ones), reversible, and tested up/down.
   - Deterministic scoring unchanged in behavior unless intentionally versioned.
   - AI output schema-validated and fail-closed; remediation gated on human approval;
     no PII/secrets in prompts.
   - No secrets/PII/customer data committed; logs clean.
   - Connectors read-only by default; events normalized and validated.
   - Lint, type-check, and all test suites green.
3. **Review the diff** against `security-review` — resolve any blockers.
4. **Check docs/ADRs** are updated if architecture or contracts changed.
5. **Confirm environment/config** (Key Vault refs, env vars) are set for the target
   environment; no local-only shortcuts shipped.

## Additional Considerations 
Run:

* linting
* type checking
* unit tests
* integration tests
* end-to-end tests
* dependency scanning
* secret scanning
* migration validation
* final diff review

## Output
A go/no-go summary: `make verify` result, DoD checklist status, and any outstanding
blockers. Release only on a clean pass.
