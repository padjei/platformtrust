# Git Standard

> PlatformTrust engineering standard — version control, branching, and commits.
> Tracked under GitHub issue PT-002 (§10).

## 1. Purpose

This standard defines how source history is created and maintained in the
PlatformTrust repository so that the codebase remains a secure, auditable, and
reproducible supply chain. It translates the branching and commit rules of the
[Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md) (§11 Branching, §12
Commits) and the supply-chain requirements of the
[Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md) (Article XX) into
concrete, reviewer-checkable rules.

## 2. Scope

This standard applies to:

- All commits, branches, and pushes to the PlatformTrust monorepo (pnpm
  workspaces + Turborepo, per [ADR-0001](../adr/ADR-0001-use-platformtrust-monorepo.md)).
- All contributors, including human engineers and implementation agents such as
  Claude.
- All change types (code, configuration, documentation, infrastructure).

It does not restate the pull-request lifecycle (see
[PULL_REQUEST_STANDARD.md](./PULL_REQUEST_STANDARD.md)) or secret-handling
controls (see the planned `SECURE_CODING_STANDARD.md` and Handbook §22); it links
to them where they intersect.

## 3. Mandatory requirements

### 3.1 Protected default branch

- `main` MUST remain deployable at every commit.
- Contributors MUST NOT push directly to `main`. All changes MUST land through a
  pull request that passes required checks and review (Constitution Article XX;
  Handbook §11, §13).
- Branch protection on `main` MUST NOT be disabled, bypassed, or weakened by an
  implementation agent.

### 3.2 Short-lived branches

- Work MUST be performed on a short-lived branch created from the current `main`.
- Branches SHOULD be integrated quickly; long-running branches MUST be avoided
  because they increase merge, integration, review, and deployment risk (Handbook
  §11). Large work MUST be decomposed into smaller issues, branches, and pull
  requests, or guarded behind feature flags.

### 3.3 Branch naming

Branches MUST be named:

```text
<type>/PT-###-slug
```

- `<type>` MUST describe the nature of the change and align with the Handbook §11
  examples: `feature`, `fix`, `docs`, `chore`, `refactor`, `security`. Additional
  Conventional Commit type names MAY be used as a prefix where they more
  accurately describe the change, provided the prefix stays consistent with the
  commit type used for the change.
- `PT-###` MUST reference the tracking issue where one applies.
- `slug` MUST be a short, lowercase, hyphenated description.

### 3.4 Conventional Commits

Commit messages MUST follow Conventional Commits and MUST use a type from the set
enforced by [`commitlint.config.cjs`](../../commitlint.config.cjs):

`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `security`, `revert`.

- The subject line MUST use the form `<type>(optional-scope): imperative summary`.
- Commits SHOULD reference the tracking issue where the format supports it.
- Commit messages are validated locally by the Husky `commit-msg` hook (running
  Commitlint) and MUST pass before the commit is accepted.

### 3.5 Commit scope and coherence

- Each commit MUST represent one coherent, logical change.
- Unrelated modifications (for example opportunistic refactoring, formatting-only
  churn, or dependency bumps unrelated to the ticket) MUST NOT be mixed into a
  commit or branch scoped to a different change (Handbook §12; Constitution
  Article IX — one coherent product).
- Generated or noise output MUST be excluded unless the change genuinely requires
  it.

### 3.6 No secrets in history

- Secrets (API keys, tokens, passwords, certificates, private keys, credentials,
  signing keys, webhook secrets) MUST NOT be committed. Only placeholder values
  belong in `.env.example` (Handbook §22; Constitution Article XIX).
- Secret scanning runs in
  [`security.yml`](../../.github/workflows/security.yml); a finding MUST block the
  merge.
- A committed secret MUST be treated as compromised: it MUST be rotated and
  revoked. Deleting it from Git history alone is NOT sufficient (Handbook §22).
  See the planned `SECURE_CODING_STANDARD.md` for the full handling procedure.

### 3.7 Shared history integrity

- Shared history (any branch that others have pulled, and especially `main`) MUST
  NOT be rewritten (force-push, rebase-over-shared-commits, history surgery)
  without explicit approval from the designated repository authority.
- Local, unpublished history on a private branch MAY be rewritten (for example to
  clean up work-in-progress commits) before it is shared.

### 3.8 Integration and merge

- The squash-merge strategy is preferred for integrating a pull request into
  `main`, producing one coherent commit per change on the default branch.
- The final squashed commit message MUST itself satisfy §3.4.

## 4. Prohibited practices

Contributors MUST NOT:

- Push directly to `main` or any protected branch.
- Disable, bypass, or weaken branch protection or required status checks.
- Force-push or rewrite shared history without explicit designated approval.
- Commit secrets, credentials, or tokens (see §3.6).
- Combine unrelated changes in a single commit, branch, or pull request.
- Commit code that fails the local Husky hooks by skipping them (for example with
  `--no-verify`) to evade lint, formatting, or commit-message validation.

## 5. Examples

### 5.1 Branch names

Good:

```text
feature/PT-123-tenant-invitations
fix/PT-245-audit-filter
security/PT-301-token-audience-validation
docs/PT-002-git-standard
chore/PT-190-pin-lockfile
```

Bad:

```text
main-work            # no type, no issue, targets nothing reviewable
PT123                 # missing type and slug
feature/misc-fixes    # no issue, scope not coherent
my-branch             # meaningless
```

### 5.2 Commit messages

Good:

```text
feat(auth): add tenant invitation acceptance
fix(api): prevent cross-tenant evidence access
docs(standards): add git standard for PT-002
security(auth): enforce token audience validation
chore(deps): pin validation library version
```

Bad:

```text
update stuff                 # not a Conventional Commit; no scope or intent
fixed bug and refactored     # multiple unrelated changes; wrong tense
WIP                          # non-coherent, non-descriptive
feat: add feature + bump 12 deps   # scope creep beyond the change
```

## 6. Enforcement mechanisms

- **Husky pre-commit** runs lint-staged (formatting and lint on staged files).
- **Husky commit-msg** runs Commitlint against
  [`commitlint.config.cjs`](../../commitlint.config.cjs).
- **Branch protection** on `main` blocks direct pushes and requires pull requests
  and passing checks.
- **CI** ([`ci.yml`](../../.github/workflows/ci.yml)) runs `format:check`, `lint`,
  `typecheck`, `test`, `build`, and the boundary check; these MUST be green before
  merge.
- **Security scanning** ([`security.yml`](../../.github/workflows/security.yml))
  runs secret, dependency, and static scans.
- **Code review** verifies coherent scope and history hygiene per
  [PULL_REQUEST_STANDARD.md](./PULL_REQUEST_STANDARD.md).

A rule without an enforcement path is considered incomplete
([standards README](./README.md)).

## 7. Exception process

Exceptions to this standard MUST follow the Constitution's exception process
(Constitution §6): they MUST be rare, explicit, temporary, and documented, with
the affected rule, justification, security impact, compensating controls, owner,
approval authority, and expiration recorded. Silent exceptions are prohibited. An
implementation agent that encounters a conflict MUST stop at the affected boundary
and escalate rather than resolve it silently (Constitution §3.3).

## 8. Related Constitution articles

- Article XX — Secure Software Supply Chain (protected branches, required pull
  requests and reviews, secret and dependency scanning, version pinning).
- Article XIX — Infrastructure Must Be Reproducible (secrets excluded from source
  control).
- Article IX — Configuration Over Customer-Specific Code / one coherent product
  (coherent, non-forking change scope).
- Article XXII — Decisions Must Be Traceable (issue-linked, auditable history).
- §2 Authority and Precedence; §6 Exception Process; §3.3 implementation-agent
  limits.

## 9. Related Handbook sections

- §11 Branching Strategy.
- §12 Commit Standards.
- §13 Pull Request Standards.
- §22 Secret Management.
