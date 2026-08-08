# Contributing to PlatformTrust

Thank you for contributing. This document defines the workflow and standards for
changes to PlatformTrust. It aligns with the
[Engineering Handbook](docs/handbook/ENGINEERING_HANDBOOK.md) (§11 Branching,
§12 Commits, §13 Pull Requests) and the
[Constitution](docs/constitution/PLATFORMTRUST_CONSTITUTION.md).

Before starting, understand the governing invariants defined by the Constitution
and Engineering Handbook: mandatory multi-tenant isolation enforced server-side,
deny-by-default server-side authorization, and auditability of privileged
actions. Data, cloud, and authentication technologies are not decided in this
repository and are deferred to future ADRs.

## 1. Every change starts with an issue

- All work is tracked by a GitHub issue with a `PT-###` identifier.
- Read the issue, its acceptance criteria, referenced ADRs, and relevant docs
  **before** writing code. If acceptance criteria are ambiguous, ask on the
  issue before proceeding.
- Do not implement functionality outside the scope of the current issue.

## 2. Branching

- **Never push directly to `main`.** `main` is protected and must stay
  deployable.
- Branch from `main` using: `<type>/PT-###-slug`

  where `<type>` is one of `feature`, `bugfix`, `security`, `docs`, `chore`,
  `refactor`. Examples:

  ```text
  feature/PT-123-tenant-invitations
  bugfix/PT-245-fix-audit-filter
  security/PT-301-token-validation
  docs/PT-102-api-standards
  ```

- Keep branches short-lived. Decompose large work into smaller issues/PRs.

## 3. Commits (Conventional Commits)

Use Conventional Commit-style messages. Commit messages are validated by
commitlint via a git hook.

```text
<type>(optional-scope): short imperative summary
```

Examples:

```text
feat(auth): add tenant invitation acceptance
fix(api): prevent cross-tenant evidence access
docs(architecture): document event ownership
test(worker): add duplicate-delivery coverage
security(auth): enforce token audience validation
chore(deps): upgrade validation library
```

Commits should represent coherent changes, avoid unrelated modifications,
exclude secrets, and reference the issue where supported.

### Git hooks

Hooks are installed automatically by Husky on `pnpm install` (via the `prepare`
script):

- **pre-commit** runs `lint-staged` (formats/lints only the staged files).
- **commit-msg** runs commitlint on your message.

The hooks do not run the full test suite; run tests yourself before pushing.

## 4. Pull request process

- Open a PR targeting `main`. Fill out the
  [pull request template](.github/PULL_REQUEST_TEMPLATE.md) completely.
- Link the tracking issue (e.g. `Closes PT-123`).
- Keep PRs small and reviewable; decompose large changes.
- Document impact across every relevant area: security, tenant isolation,
  database, API, AI, and UX/accessibility, plus migration and rollback steps.
- All CI checks must pass, and required reviewers must approve, before merge.

## 5. Testing expectations

- New behavior must be covered by tests at the appropriate level (unit,
  integration, e2e).
- **Tenant-owned features must include tenant-isolation tests** (tenant A cannot
  read/write tenant B's data) and authorization-failure tests for privileged
  actions.
- Keep tests deterministic — no reliance on real network, wall-clock, or random
  ordering. Fixtures must use synthetic data, never secrets or PII.
- Do not skip, `xfail`, disable, or weaken tests to make a build pass.

Run locally before pushing:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
node scripts/check-app-boundaries.mjs

# AI service (apps/ai-service)
cd apps/ai-service
uv run ruff check .
uv run ruff format --check .
uv run mypy .
uv run pytest
```

## 6. Documentation expectations

- Update `docs/`, ADRs, READMEs, and inline documentation whenever behavior or
  architecture changes.
- New architecturally significant decisions require an ADR under `docs/adr/`
  (see Handbook §10).
- Never document or claim a compliance certification without documented proof.

## 7. Security & scope

- Never commit secrets, credentials, tokens, PII, or customer data.
- Enforce authorization and tenant scoping server-side; never trust the client
  for identity, tenant, or authorization decisions.
- Do not bundle unrelated refactoring into a feature or fix PR.

See [`SECURITY.md`](SECURITY.md) for vulnerability reporting and secret-exposure
handling.
