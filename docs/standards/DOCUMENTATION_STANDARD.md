# Documentation Standard

> PlatformTrust engineering standard — documentation as part of the product.
> Tracked under GitHub issue PT-002 (§12).

## 1. Purpose

This standard defines how PlatformTrust documentation is created, located, and
kept truthful so that documentation is genuinely part of the product rather than
an afterthought. It translates the
[Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md) (Article XXI —
Documentation Is Part of the Product; Article XXII — Decisions Must Be Traceable)
and [Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md) §38 (Documentation
Standards) and §10 (ADRs) into concrete, reviewer-checkable rules.

## 2. Scope

This standard applies to all documentation in the PlatformTrust monorepo,
including READMEs, architecture docs, API references, ADRs, runbooks, release
notes, migration guides, and inline documentation. It applies to human and
implementation-agent authors alike.

## 3. Mandatory requirements

### 3.1 Version-controlled and current

- Documentation MUST live in the repository under version control and change
  through the same pull-request flow as code
  ([PULL_REQUEST_STANDARD.md](./PULL_REQUEST_STANDARD.md); Handbook §38).
- Documentation MUST accurately reflect the implemented system. A feature is
  incomplete until the required documentation is created or updated (Constitution
  Article XXI). Documentation that no longer matches behavior MUST be corrected or
  removed in the same change that alters the behavior.

### 3.2 Durable artifacts for material decisions

- Material product and engineering decisions MUST leave behind a durable, approved
  artifact (Constitution Article XXII). For architecture-level decisions in the
  categories listed in Handbook §10.1, that artifact MUST be an Architecture
  Decision Record (ADR).
- ADRs MUST live in [`docs/adr/`](../adr/), be named
  `ADR-XXXX-kebab-title.md`, and follow the Handbook §10.3 template with the
  sections in order: Status, Context, Decision, Alternatives Considered,
  Consequences, Security Impact, Operational Impact, Migration Impact, References.
- ADR `Status` MUST be one of `Proposed`, `Accepted`, `Superseded`, or `Rejected`.
  ADR history MUST be preserved; superseded ADRs MUST remain in the repository.
  See [ADR-0001](../adr/ADR-0001-use-platformtrust-monorepo.md) and
  [ADR-0002](../adr/ADR-0002-initial-application-technology-stack.md) as
  reference examples. Authority to move an ADR to `Accepted` is defined in
  [PULL_REQUEST_STANDARD.md](./PULL_REQUEST_STANDARD.md) §6.

### 3.3 README boundaries

- A README MUST describe what a repository, application, or package is and how to
  use, build, or run it for its intended audience (Handbook §38).
- A README MUST NOT be used as an alternate source of truth for architecture,
  decisions, or governance. Architectural rationale belongs in ADRs and the
  architecture docs; authoritative rules belong in the Constitution, Handbook, and
  standards. A README SHOULD link to those sources rather than restate them.

### 3.4 API documentation

- APIs MUST be documented as versioned contracts: version, request/response
  shape, authentication/authorization expectations, tenant-awareness, and
  breaking-change/deprecation notes (Constitution Article VIII; Handbook §16, §38).
- API documentation MUST be updated in the same change that adds or changes an
  endpoint or contract.

### 3.5 Runbooks

- Operational capabilities and services MUST have runbooks covering routine
  operation, failure handling, and recovery expectations, kept current with the
  system (Constitution Article XXI; Handbook §38). Runbooks MUST identify the
  owning team or role (Constitution Article XXIII).

### 3.6 Release notes and migration guides

- Releases MUST be accompanied by release notes describing what changed at a level
  useful to their audience.
- Changes that require operational action (migrations, configuration, backfills)
  MUST include migration instructions, consistent with the PR's migration and
  rollback sections
  ([`.github/pull_request_template.md`](../../.github/pull_request_template.md)).

### 3.7 Single source of truth

- Authoritative rules MUST NOT be duplicated across documents. Each rule MUST have
  a single authoritative home; other documents MUST link to it rather than copy it
  (Constitution Article IX — one coherent product; Handbook §38). This prevents
  divergence when one copy is updated and another is not.

### 3.8 Linking

- Cross-references within the repository SHOULD use repository-relative links (for
  example `../adr/ADR-0001-use-platformtrust-monorepo.md`) rather than absolute
  `owner/repo` URLs, so links survive repository renames, forks, or migrations.
- Links MUST resolve to existing targets; a documentation change MUST NOT
  introduce broken internal links.

## 4. Prohibited practices

Authors MUST NOT:

- Merge documentation that contradicts the implemented behavior.
- Use a README as the authoritative record of architecture or decisions.
- Copy authoritative rules into multiple files instead of linking to one source.
- Record a decision without the required durable artifact where Article XXII or
  Handbook §10.1 requires one.
- Introduce broken internal links or absolute `owner/repo` links where a
  repository-relative link is practical.

## 5. Examples

Good:

- An endpoint change updates the API reference and the API-impact PR section in
  the same PR.
- A framework choice is recorded as a `Proposed` ADR under
  [`docs/adr/`](../adr/), then moved to `Accepted` by the designated authority.
- A standard states a rule once; other docs link to it with a repository-relative
  path.

Bad:

- The README documents a different auth flow than the code implements.
- The same tenant-isolation rule is restated (and later diverges) in three files.
- A significant architecture change ships with no ADR.
- A doc links to `https://github.com/owner/repo/blob/main/docs/...` instead of a
  relative path.

## 6. Enforcement mechanisms

- **Pull-request review** verifies documentation accuracy, README boundaries,
  single-source-of-truth, and ADR presence per
  [PULL_REQUEST_STANDARD.md](./PULL_REQUEST_STANDARD.md).
- The **PR template** requires a Documentation section and impact declarations
  ([`.github/pull_request_template.md`](../../.github/pull_request_template.md)).
- **Formatting checks** — `format:check` in
  [`ci.yml`](../../.github/workflows/ci.yml) keeps Markdown Prettier-clean.
- **Definition of Done** treats documentation as a completion gate (Handbook §47;
  Constitution §5).

## 7. Exception process

Exceptions MUST follow the Constitution's exception process (Constitution §6):
rare, explicit, temporary, and documented, with the affected rule, justification,
impact, compensating controls, owner, approval authority, and expiration
recorded. Silent exceptions are prohibited. An implementation agent that finds a
decision lacking its required artifact MUST stop at that boundary and escalate
(Constitution §3.3).

## 8. Related Constitution articles

- Article XXI — Documentation Is Part of the Product.
- Article XXII — Decisions Must Be Traceable.
- Article VIII — APIs Are Versioned Contracts.
- Article IX — one coherent product (single source of truth).
- Article XXIII — Domain Ownership Must Be Clear (owned documentation, runbooks).
- §2 Authority and Precedence; §5 Constitutional Definition of Done; §6 Exception
  Process; §3.3 implementation-agent limits.

## 9. Related Handbook sections

- §38 Documentation Standards.
- §10 Architecture Decision Records (§10.1 when required, §10.2 naming, §10.3
  template).
- §16 API Standards.
- §47 Definition of Done.
