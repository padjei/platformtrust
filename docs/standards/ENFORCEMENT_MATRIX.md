# Standards Enforcement Matrix

| Attribute      | Value                                                                 |
| -------------- | --------------------------------------------------------------------- |
| Document owner | PlatformTrust Engineering                                              |
| Applies to     | All 15 engineering standards in this directory                         |
| Source issue   | PT-002 §20                                                             |

---

## Purpose

This matrix maps each engineering standard to how it is actually enforced today.
It is deliberately conservative: it does **not** claim automated enforcement that
does not exist. A standard whose enforcement is only partial or manual is marked
so, and any concern that has no appropriate enforcement is tracked as a gap in the
[Gaps](#known-gaps) section.

## Legend

- **Enforced now** — a blocking automated check runs in CI or a Git hook. A
  non-compliant change fails the check.
- **Process enforced** — enforced by Git hooks that can be bypassed locally, the
  pull request template, and/or human review; not a blocking automated gate.
- **Not yet automated** — no automated enforcement exists for the standard's core
  concern; it relies on the owning ticket and review until future automation. This
  is an identified gap.

Automated checks come from
[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) and
[`.github/workflows/security.yml`](../../.github/workflows/security.yml). Git hooks
come from Husky (`pre-commit` → lint-staged; `commit-msg` → Commitlint). Process
controls come from the
[pull request template](../../.github/pull_request_template.md), CODEOWNERS, and
human code, architecture, and security review.

## Matrix

| Standard                                                | Automated (CI / hooks)                                                                              | Process (PR / review / hooks)                                     | Not yet automated / future                                        | Category                        |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------- |
| [Coding Standard](./CODING_STANDARD.md)                 | Prettier `format:check`; ESLint; `tsc` strict; Vitest; build; app-boundary check; pre-commit lint-staged | Code review                                                       | Semantic rules (naming, cohesion) rely on review                  | **Enforced now** + Process      |
| [TypeScript Standard](./TYPESCRIPT_STANDARD.md)         | ESLint (`eslint.config.mjs`); `tsc` strict (`tsconfig.base.json`); Prettier; pre-commit lint-staged | Code review                                                       | —                                                                 | **Enforced now**                |
| [Python Standard](./PYTHON_STANDARD.md)                 | Ruff `check`; Ruff `format --check`; MyPy strict; Pytest (`apps/ai-service`); pre-commit lint-staged | Code review                                                       | —                                                                 | **Enforced now**                |
| [Secure Coding Standard](./SECURE_CODING_STANDARD.md)   | gitleaks secret scan; pip-audit; pnpm audit (advisory, non-blocking); repository security-check step | Security review (Handbook §20); PR security section; code review  | Authorization tests; tenant-isolation tests; SSRF/upload checks   | **Enforced now** + Process      |
| [Testing Standard](./TESTING_STANDARD.md)               | Vitest and Pytest execute in CI (tests must pass)                                                    | Review judges test adequacy and negative-path coverage           | Coverage measurement; presence of authz/tenant/a11y/AI tests      | **Enforced now** (execution) + Process |
| [Logging Standard](./LOGGING_STANDARD.md)               | Lint may flag stray `console` use                                                                    | Code review of log content and levels                            | Automated detection of secrets/PII in logs                        | **Process enforced**            |
| [Observability Standard](./OBSERVABILITY_STANDARD.md)   | —                                                                                                    | Architecture and code review                                     | Metrics, distributed tracing, health/readiness, SLIs             | **Not yet automated**           |
| [Error Handling Standard](./ERROR_HANDLING_STANDARD.md) | ESLint (e.g. no empty catch) and `tsc` catch some cases                                              | Code review of error paths and safe responses                   | Full "no silent failure / safe error response" verification       | **Process enforced** (partial lint) |
| [Git Standard](./GIT_STANDARD.md)                       | Commitlint `commit-msg` hook (Conventional Commits)                                                  | `main` branch protection; required PR; review                   | Server-side commit-message enforcement (hook is local/bypassable) | **Enforced now** (hook) + Process |
| [Pull Request Standard](./PULL_REQUEST_STANDARD.md)     | CI required checks gate the PR                                                                        | PR template declarations and checklist; human review            | Automated verification that template sections are completed       | **Process enforced**            |
| [Documentation Standard](./DOCUMENTATION_STANDARD.md)   | Prettier formats Markdown (`format:check`; lint-staged)                                              | Review confirms docs are current and accurate                   | Doc-completeness / freshness checks                               | **Process enforced** (formatting automated) |
| [Dependency Management](./DEPENDENCY_MANAGEMENT.md)     | pip-audit (blocking); pnpm audit (advisory, non-blocking); frozen lockfiles                          | Review of dependency justification (Handbook §37)               | License-compatibility review; making pnpm audit blocking          | **Enforced now** (partial) + Process |
| [Accessibility Standard](./ACCESSIBILITY_STANDARD.md)   | —                                                                                                    | UX/accessibility review; PR UX & accessibility section          | Automated accessibility testing (axe/Playwright, manual review)   | **Not yet automated**           |
| [AI Engineering Standard](./AI_ENGINEERING_STANDARD.md) | AI-service Ruff/MyPy/Pytest and secret scan (code quality only, not AI behavior)                     | AI-impact PR section; security review for new providers; review | AI evaluations; tenant-safe-retrieval tests; prompt-injection tests; schema/prompt-drift gates | **Not yet automated** (AI behavior) + Process |
| [Definition of Done](./DEFINITION_OF_DONE.md)           | Always-required lint/format/type/test/build/boundary; secret and dependency scanning                | PR checklist; code, architecture, and security review           | Conditional items: authz, tenant isolation, a11y, performance, AI evals, coverage | **Enforced now** (always-required) + Process |

## Known gaps

The following concerns are **not** automatically enforced today and are tracked as
gaps. Until automation exists, they are enforced by the owning ticket, the pull
request template, and human review, per the referenced standards:

- **Accessibility testing** — no automated WCAG checks; manual and review-based
  only (Accessibility Standard; Constitution Article XIV).
- **Tenant-isolation tests** — presence and correctness verified by review, not by
  an automated gate (Secure Coding / Testing Standards; Constitution Article I).
- **Authorization tests** — 401/403 negative-path coverage verified by review, not
  automated (Secure Coding / Testing Standards; Constitution Article III/IV).
- **Observability** — metrics, distributed tracing, and health/readiness are
  review-based; no SLO/SLI enforcement (Observability Standard; Constitution
  Article XVII).
- **AI evaluations** — accuracy, groundedness, hallucination, tenant-safe
  retrieval, and prompt-injection resistance are not gated in CI (AI Engineering
  Standard; Constitution Article X/XIII).
- **Coverage measurement** — tests must pass, but no coverage is measured or
  threshold enforced (Testing Standard).
- **Dependency-license review** — license compatibility is reviewed manually;
  `pnpm audit` is advisory and non-blocking (Dependency Management; Constitution
  Article XX).

No numeric coverage thresholds or SLO/SLI targets are defined by these standards;
those remain deferred. A standard without appropriate enforcement is considered
incomplete and MUST be tracked here until enforcement is added (standards
[README](./README.md)).

## Related documents

- Standards index and precedence — [README](./README.md).
- [Definition of Done](./DEFINITION_OF_DONE.md).
- [PlatformTrust Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md) and
  [Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md).
