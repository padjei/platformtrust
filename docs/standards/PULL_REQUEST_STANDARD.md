# Pull Request Standard

> PlatformTrust engineering standard — pull request content, review, and approval.
> Tracked under GitHub issue PT-002 (§11).

## 1. Purpose

This standard defines what a PlatformTrust pull request (PR) must contain, how it
is reviewed, and who may approve which kinds of decisions. It translates the pull
request and review rules of the
[Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md) (§13 Pull Requests,
§14 AI-generated code review) and the traceability, ownership, and supply-chain
requirements of the [Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md)
(Articles XX, XXII, XXIII) into concrete, reviewer-checkable rules. It complements
the branching and commit rules in [GIT_STANDARD.md](./GIT_STANDARD.md).

## 2. Scope

This standard applies to every PR targeting a protected branch in the
PlatformTrust monorepo, authored by human engineers or implementation agents such
as Claude. The canonical PR body is defined by
[`.github/pull_request_template.md`](../../.github/pull_request_template.md); this
standard defines the rules behind that template.

## 3. Mandatory requirements

### 3.1 Issue linkage and scope

- Every material PR MUST link its tracking issue (for example `Closes PT-###`).
- The PR's scope MUST match the linked issue. Changes beyond the issue's scope
  MUST NOT be included; unrelated work MUST move to its own issue and PR
  (Constitution Article IX; Handbook §13).

### 3.2 Required PR content

Each PR MUST complete the applicable sections of
[`.github/pull_request_template.md`](../../.github/pull_request_template.md). Where
an impact area was considered but does not apply, it MUST be marked `N/A` rather
than deleted silently. Required content includes:

- **Implementation summary** — what changed and why.
- **Linked issue** — the `PT-###` reference.
- **Type of change**.
- **Impact declarations** — security, tenant isolation, database, API, AI, and
  UX/accessibility impact (each MUST be addressed or marked `N/A`). These map
  directly to the template's impact sections and to Constitution Articles I
  (multi-tenancy), VIII (API contracts), X/XIII (AI), and XIV (accessibility).
- **Tests performed** — the tests run and added (see §3.3).
- **Migration steps and rollback considerations**.
- **Documentation** — what docs were updated, or `N/A`
  (see [DOCUMENTATION_STANDARD.md](./DOCUMENTATION_STANDARD.md)).

### 3.3 Required tests

- The PR MUST include tests appropriate to the change, and describe them in the
  template's "Tests performed" section.
- Where the change touches an authorization or tenant boundary, tenant-isolation
  and authorization-failure coverage MUST be included (Constitution Article I;
  Handbook §13, §19).

### 3.4 Required automated checks

- CI MUST be green before merge. The
  [`ci.yml`](../../.github/workflows/ci.yml) pipeline (`format:check`, `lint`,
  `typecheck`, `test`, `build`, boundary check) and the
  [`security.yml`](../../.github/workflows/security.yml) scans MUST pass.
- A PR MUST NOT be merged with failing or bypassed required checks (Constitution
  Article XX — unverified code must not reach production).

### 3.5 Review is required

- Every PR MUST be reviewed before merge; approval MUST NOT be based only on
  whether the code compiles or CI is green (Handbook §13).
- Reviewers MUST evaluate correctness, security, authorization, tenant isolation,
  maintainability, test quality, error handling, observability, documentation,
  architectural consistency, performance, accessibility, and data-migration
  safety (Handbook §13).
- Code authored by an implementation agent MUST be reviewed as untrusted output:
  reviewers MUST verify it matches the ticket, invents no product behavior,
  removes no security controls, enforces tenant context and explicit
  authorization, introduces no unapproved dependencies or secrets, and follows
  repository conventions (Handbook §14; Constitution §3.3).

### 3.6 Reviewable size

- PRs SHOULD be small enough to review effectively. Large PRs MUST be decomposed
  unless the change is inherently atomic, in which case additional reviewer
  guidance MUST be provided (Handbook §13).

## 4. Review severity vocabulary

Reviewers MUST classify each review comment with one of the following severities
so that authors can triage consistently:

| Severity     | Meaning                                                                                    | Effect on merge                        |
| ------------ | ------------------------------------------------------------------------------------------ | -------------------------------------- |
| **Critical** | Security, tenant-isolation, data-loss, or constitutional violation; unsafe to merge.       | MUST block merge (REQUEST CHANGES).    |
| **High**     | Correctness defect, missing required test, or broken contract likely to cause a real bug.  | MUST block merge (REQUEST CHANGES).    |
| **Medium**   | Maintainability, design, or clarity issue that should be fixed but is not release-blocking. | SHOULD be resolved before merge.       |
| **Low**      | Minor improvement or non-urgent suggestion.                                                | MAY be deferred with author agreement. |
| **Nit**      | Cosmetic or stylistic preference not covered by automated tooling.                          | Non-blocking; optional.                |

## 5. Approve vs. request changes

- A reviewer MUST select **REQUEST CHANGES** when any **Critical** or **High**
  finding is open, when required checks are failing, when the PR is out of scope
  for its linked issue, or when required template sections are missing.
- A reviewer MAY **APPROVE** when no Critical or High findings remain, required
  checks pass, scope matches the issue, and required content is complete. Open
  Medium, Low, or Nit items MAY remain if the author and reviewer agree on
  follow-up.

## 6. Architecture and security approval authority

- Implementation agents (including Claude) and implementation engineers MUST NOT
  self-declare architecture or security approval. Decisions about product
  behavior, permissions, tenant-isolation rules, business logic, database
  ownership, API contracts, security controls, UX flows, compliance behavior, AI
  authority, data retention, or audit requirements MUST be approved by the
  designated human product/architecture/security authority (Constitution §3.3,
  Article XXIII; Handbook §14).
- **ADR proposals:** An implementation agent MAY author an ADR proposal (using the
  Handbook §10.3 template, under [`docs/adr/`](../adr/)). It MUST NOT declare its
  own proposed ADR institutionally Accepted merely because a ticket requested the
  work. A proposed ADR remains non-authoritative and its status MUST stay
  `Proposed` until the designated product/architecture/security authority approves
  it during review; only then may its status become `Accepted`. This mirrors how
  [ADR-0001](../adr/ADR-0001-use-platformtrust-monorepo.md) and
  [ADR-0002](../adr/ADR-0002-initial-application-technology-stack.md) were ratified
  through architecture review, not by the implementer. Recording an approval that
  did not occur would be a silent exception (Constitution §6).
- Where a change touches an area listed in Handbook §10.1 without an approved ADR,
  the reviewer MUST issue a Critical or High finding and the implementation agent
  MUST stop at that boundary and escalate rather than proceed (Constitution §3.3).

## 7. Exception process

Exceptions MUST follow the Constitution's exception process (Constitution §6):
rare, explicit, temporary, and documented, with the affected rule, justification,
security and compliance impact, compensating controls, owner, approval authority,
and expiration recorded. Silent exceptions — including approving out-of-scope
work, merging past failing checks, or recording unearned architecture approval —
are prohibited.

## 8. Related Constitution articles

- Article XX — Secure Software Supply Chain (required PRs, reviews, checks).
- Article XXII — Decisions Must Be Traceable (issue linkage, ADRs).
- Article XXIII — Domain Ownership Must Be Clear (approval authority).
- Article VIII — APIs Are Versioned Contracts (API impact review).
- Article I — Multi-Tenancy Is Mandatory (tenant-isolation review and tests).
- Articles X and XIII — AI must be explainable and fail safely (AI impact review).
- §2 Authority and Precedence; §3.3 implementation-agent limits; §6 Exception
  Process.

## 9. Related Handbook sections

- §13 Pull Request Standards (content, size, required checks, review rules).
- §14 Code Review Guidance for AI-Generated Code.
- §10 Architecture Decision Records (§10.1 when required, §10.3 template).
- §11 Branching Strategy; §12 Commit Standards (see
  [GIT_STANDARD.md](./GIT_STANDARD.md)).
- §47 Definition of Done.
