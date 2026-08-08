# Dependency Management Standard

> PlatformTrust engineering standard — adding, resolving, and removing dependencies.
> Tracked under GitHub issue PT-002 (§13).

## 1. Purpose

This standard defines how third-party dependencies are justified, reviewed,
resolved, and removed in the PlatformTrust monorepo so that the software supply
chain stays secure, reproducible, and free of avoidable lock-in. It translates the
[Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md) (Article XX — Secure
Software Supply Chain) and [Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md)
§37 (Dependency Management) and §10 (ADRs) into concrete, reviewer-checkable rules.

> This standard does not itself add, upgrade, or remove any dependency; it defines
> the rules that govern such changes.

## 2. Scope

This standard applies to all runtime and development dependencies across the
monorepo (pnpm workspaces + Turborepo, per
[ADR-0001](../adr/ADR-0001-use-platformtrust-monorepo.md)): TypeScript/JavaScript
packages managed with pnpm, and Python packages for the AI service managed with
uv, as established in
[ADR-0002](../adr/ADR-0002-initial-application-technology-stack.md). It applies to
human and implementation-agent contributors.

## 3. Mandatory requirements

### 3.1 Clear purpose

- Every added dependency MUST have a clear, stated purpose tied to a requirement.
  A dependency MUST NOT be added speculatively or for functionality already
  provided by the platform or existing dependencies (Handbook §37; Constitution
  Article IX).

### 3.2 Maintained and reputable

- New dependencies MUST be actively maintained and SHOULD be broadly supported
  with a healthy release and security-response history. Dependencies with unclear
  ownership MUST NOT be introduced (Handbook §37).
- Abandoned or unmaintained libraries MUST NOT be added, and existing ones SHOULD
  be scheduled for replacement.

### 3.3 License compatibility

- Every new dependency's license MUST be reviewed for compatibility with
  PlatformTrust's licensing before it is added. Incompatible or unclear licenses
  MUST NOT be introduced (Handbook §37).

### 3.4 Security and vulnerability review

- Every new or upgraded dependency MUST be security-reviewed and MUST NOT
  introduce a known unresolved critical vulnerability (Constitution §5; Handbook
  §37).
- Dependency and audit scanning runs in
  [`security.yml`](../../.github/workflows/security.yml); findings MUST be
  addressed before merge. See the planned `SECURE_CODING_STANDARD.md` for the full
  vulnerability-handling procedure.
- Dependencies requiring excessive privileges or introducing unacceptable data
  sharing MUST NOT be added (Handbook §37).

### 3.5 Exact, locked resolution

- Dependency versions MUST be pinned and resolved through committed lockfiles:
  [`pnpm-lock.yaml`](../../pnpm-lock.yaml) for TypeScript/JavaScript and `uv.lock`
  for the AI service (Constitution Article XX — version pinning; ADR-0001;
  ADR-0002).
- Installs MUST use frozen/locked resolution (for example pnpm frozen-lockfile
  installs and `uv` locked installs) so CI and local builds are reproducible. The
  lockfile MUST be updated and committed in the same change that changes a
  dependency.

### 3.6 No overlapping dependencies

- A new dependency MUST NOT duplicate a responsibility already covered by an
  existing, sanctioned dependency. Overlapping libraries for the same purpose MUST
  be consolidated (Handbook §37; Constitution Article IX — one coherent product).

### 3.7 ADRs for major dependencies

- Major dependency or framework selections — those covered by Handbook §10.1 (for
  example a major framework, or a difficult-to-reverse or strategically
  significant choice) — MAY require an Architecture Decision Record and MUST have
  one where §10.1 applies. The ADR MUST follow the Handbook §10.3 template and be
  approved by the designated authority before the dependency is treated as
  sanctioned (see [PULL_REQUEST_STANDARD.md](./PULL_REQUEST_STANDARD.md) §6).

### 3.8 Provider SDKs stay behind boundaries

- SDKs for external providers MUST remain behind PlatformTrust's own provider
  boundaries/adapters and MUST NOT leak provider-specific types or calls into
  application or domain code. This preserves neutrality and replaceability and
  keeps blast radius contained, consistent with the AI service being a separate,
  provider-neutral deployable (ADR-0002; Constitution Articles IX and XIII;
  Handbook §37 — avoid avoidable lock-in).

### 3.9 Removal of unused dependencies

- Dependencies that are no longer used MUST be removed, together with their
  lockfile entries and any related configuration, in the change that renders them
  unused (Handbook §36 — technical debt; §37). Dead dependencies MUST NOT be left
  in the manifest.

## 4. Prohibited practices

Contributors MUST NOT:

- Add a dependency without a clear, requirement-linked purpose.
- Add abandoned, unmaintained, or unclear-ownership libraries.
- Add a dependency with an incompatible or unreviewed license.
- Add or upgrade a dependency with a known unresolved critical vulnerability.
- Introduce or commit changes with unpinned versions or an un-updated lockfile.
- Add a dependency that overlaps an existing one for the same responsibility.
- Import a provider SDK directly into application/domain code outside its adapter
  boundary.
- Leave unused dependencies in the manifests or lockfiles.

## 5. Examples

Good:

- A single, maintained, license-compatible validation library is added for a
  stated need; `pnpm-lock.yaml` is updated in the same PR; the PR states the
  purpose and passes dependency scanning.
- A major framework choice is recorded as a `Proposed` ADR, reviewed, and only
  then adopted.
- A provider client is wrapped by an adapter in a package boundary; application
  code depends on the adapter, not the SDK.

Bad:

- Two libraries that both do date formatting are added in different apps.
- A dependency is added but the lockfile is not committed, breaking frozen
  installs.
- A provider SDK type appears directly in a domain service.
- A replaced library is left in `package.json` after its last usage is deleted.

## 6. Enforcement mechanisms

- **Security scanning** — [`security.yml`](../../.github/workflows/security.yml)
  runs dependency/audit scanning (and secret and static scans).
- **Frozen installs** — CI ([`ci.yml`](../../.github/workflows/ci.yml)) installs
  from committed lockfiles, failing on drift.
- **Pull-request review** verifies purpose, license, maintenance, non-overlap,
  provider-boundary placement, and removal of unused dependencies per
  [PULL_REQUEST_STANDARD.md](./PULL_REQUEST_STANDARD.md).
- **Architecture review / ADR gate** for major dependencies (Handbook §10.1).
- **Definition of Done** — no unresolved critical vulnerability may remain
  (Constitution §5; Handbook §47).

## 7. Exception process

Exceptions MUST follow the Constitution's exception process (Constitution §6):
rare, explicit, temporary, and documented, with the affected rule, business and
technical justification, security impact, compensating controls, owner, approval
authority, and expiration recorded. Silent exceptions are prohibited. An
implementation agent that needs a dependency raising an unresolved
architecture/security question MUST stop at that boundary and escalate rather than
add it silently (Constitution §3.3).

## 8. Related Constitution articles

- Article XX — Secure Software Supply Chain (version pinning, dependency scanning,
  artifact integrity, vulnerability management).
- Article IX — one coherent product (no overlap, no avoidable lock-in).
- Article XIII — AI Must Fail Safely (provider neutrality for the AI service).
- Article XXII — Decisions Must Be Traceable (ADRs for major dependencies).
- §2 Authority and Precedence; §5 Constitutional Definition of Done; §6 Exception
  Process; §3.3 implementation-agent limits.

## 9. Related Handbook sections

- §37 Dependency Management.
- §10 Architecture Decision Records (§10.1 when required, §10.3 template).
- §36 Technical Debt (removal of unused dependencies).
- §22 Secret Management (dependencies must not require committed secrets).
- §47 Definition of Done.
