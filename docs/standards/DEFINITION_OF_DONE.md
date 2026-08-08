# Definition of Done

| Attribute      | Value                                                                 |
| -------------- | --------------------------------------------------------------------- |
| Document owner | PlatformTrust Engineering                                              |
| Applies to     | Every change merged into `main`                                        |
| Source issue   | PT-002 §16                                                             |
| Precedence     | Below the Constitution, ADRs, security requirements, and the Handbook  |

---

## 1. Purpose

This standard consolidates the Constitutional Definition of Done (Constitution §5)
and Handbook §47 into a single, reviewable checklist. It exists so that an author
and a reviewer can objectively determine whether a change is complete.

It draws a sharp line between requirements that apply to **every** change and
requirements that apply **only when the change touches that concern**. A ticket
that legitimately does not touch the database, authorization, tenancy, AI, or the
UI MUST NOT be blocked for lacking database migrations, authorization tests,
tenant-isolation tests, AI evaluations, or accessibility validation. Applying a
conditional item where it does not apply is itself a defect: it manufactures busywork
and dilutes the checklist.

## 2. Scope

This standard applies to every change merged into `main`: features, bug fixes,
refactors, documentation, tooling, and migrations, authored by contributors or
coding agents (Constitution §3.3; Handbook §3.3). Where a specific ticket's
Definition of Done adds requirements, they are additive and MUST NOT weaken this
standard.

"Applicable" throughout means the change actually creates, modifies, or removes
behavior in the named concern. When in doubt about whether a conditional item
applies, the author MUST state the determination in the pull request rather than
silently skipping it (Constitution §6).

## 3. Always required

These items apply to **every** change and MUST all be satisfied before merge.

- [ ] **Acceptance criteria met** — every acceptance criterion in the linked issue
      is satisfied (Constitution §5; Handbook §47).
- [ ] **Scope respected** — the diff stays within the linked issue; no unrelated
      refactoring or scope creep (Handbook §12; CLAUDE.md).
- [ ] **Required tests pass** — `pnpm test` passes, and `uv run pytest` passes for
      `apps/ai-service` when it is touched; new behavior ships with tests
      (Constitution Article XVI; Handbook §28).
- [ ] **Lint, format, type, and static checks pass** — `pnpm format:check`,
      `pnpm lint`, `pnpm typecheck`, `pnpm build`, and
      `node scripts/check-app-boundaries.mjs`; for `apps/ai-service`,
      `uv run ruff check .`, `uv run ruff format --check .`, and `uv run mypy .`
      (Coding Standard §6).
- [ ] **No secrets or sensitive data** — no credentials, tokens, keys, PII, or real
      customer data in source, tests, fixtures, logs, comments, or prompts
      (Constitution Article VI, XIX; Handbook §22).
- [ ] **Error handling is explicit** — no silent failure paths; errors are handled
      or surfaced through structured errors (Coding Standard §3.3; Handbook §24).
- [ ] **Documentation current** — documentation affected by the change is created
      or updated to reflect the implemented system (Constitution Article XXI;
      Handbook §38).
- [ ] **No unresolved critical/high findings** — no unresolved critical or high
      security or constitutional finding remains, and no placeholder `TODO` stands
      in for required behavior (Constitution §5; Handbook §35).
- [ ] **Change is reviewed** — the pull request is reviewed; AI-generated code is
      reviewed as untrusted (Handbook §13, §14).
- [ ] **Traceability** — the change references its tracking issue (PT-###) and any
      material decision leaves an approved artifact (Constitution Article XXII).

## 4. Conditionally required

Each item below applies **only when the change touches that concern**. Mark it
**N/A** with a one-line reason when it does not apply; mark it complete when it
does.

- [ ] **Authorization** — when the change adds or alters a protected action or
      resource: authorization is enforced server-side, deny-by-default, and covered
      by tests including authorization-failure (401/403) cases (Constitution Article
      III, IV; Handbook §18; `.claude/rules/security.md`).
- [ ] **Tenant isolation** — when the change adds or alters a tenant-owned data
      path: isolation is enforced server-side and covered by negative tests (tenant
      A cannot read/modify/reference tenant B). Frontend filtering is never an
      isolation control (Constitution Article I; Handbook §19).
- [ ] **Database migration** — when the change alters schema: a version-controlled
      migration is included, is reversible or roll-forward-safe, and is not an edit
      to an already-committed migration (Handbook §17). _The database, ORM, and
      persistence-layer isolation mechanism are deferred to a future ADR; this item
      applies once a data layer exists._
- [ ] **Audit events** — when the change adds a privileged or state-changing action:
      a durable audit event is emitted with the required context (Constitution
      Article II; Handbook §23).
- [ ] **Observability** — when the change adds or alters a service behavior worth
      operating: structured logs and relevant metrics/telemetry are present, with no
      secrets or sensitive data (Constitution Article XVII; Handbook §25).
- [ ] **Accessibility validation** — when the change alters user-facing UI: keyboard,
      screen-reader, focus, contrast, and explicit loading/empty/error states are
      validated against WCAG 2.2 AA (Constitution Article XIV; Handbook §39).
- [ ] **Performance validation** — when the change has defined performance
      expectations or touches a known scale risk: those expectations are measured,
      not assumed (Constitution Article XXVII; Handbook §40).
- [ ] **AI evaluations** — when the change adds or alters an AI feature, prompt,
      retrieval pipeline, or output schema: it is evaluated before release and
      machine-readable output is schema-validated and fails closed (Constitution
      Article X, XIII; Handbook §27;
      [AI Engineering Standard](./AI_ENGINEERING_STANDARD.md)).
- [ ] **Rollback plan** — when the change is a material release, migration, or
      operational change: a safe rollback or recovery path is documented and does
      not abandon customer data (Constitution Article XVIII; Handbook §32).
- [ ] **Security review** — when the change hits a security-review trigger
      (authn/authz, tenant isolation, new integration or public API, new AI
      provider, sensitive data, file upload, export, admin tooling, cryptography)
      (Handbook §20).
- [ ] **ADR** — when the change makes a material, hard-to-reverse architectural
      decision: an ADR is authored and Accepted before merge; a Proposed ADR is not
      authoritative (Handbook §10; Constitution Article XXII).

## 5. Prohibited practices

- MUST NOT mark a change Done while any **always-required** item is unmet.
- MUST NOT require a conditional item (migration, authorization/tenant-isolation
  tests, audit events, AI evaluations, accessibility, performance, rollback, ADR)
  for a ticket that does not touch that concern — this standard MUST NOT be read to
  demand database, auth, or tenant implementation where none exists.
- MUST NOT skip a conditional item that **does** apply, or mark it N/A without a
  stated reason (Constitution §6).
- MUST NOT disable, weaken, or bypass a check to make CI pass (Handbook §14;
  CLAUDE.md).

## 6. Examples

Applying the split to two different tickets (illustrative):

```text
Ticket A — "Add a new tenant-scoped API endpoint that writes a record"
  Always required:      all items.
  Conditionally applies: authorization, tenant isolation, audit events,
                         observability, database migration, security review.
  N/A:                   accessibility (no UI), AI evaluations (no AI).

Ticket B — "Fix a typo in a README"
  Always required:      acceptance criteria, scope, lint/format/build,
                        no secrets, documentation current, reviewed, traceable.
  N/A:                   authorization, tenant isolation, migration, audit,
                        accessibility, performance, AI, rollback, security
                        review, ADR — the change touches none of these.
```

## 7. Enforcement mechanisms

Enforcement is **partly automated and partly process-based**; a rule without
enforcement is tracked as a gap (standards `README.md`).

- Automated today: the always-required lint/format/type/test/build/boundary checks
  in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), and secret
  scanning and dependency audit in
  [`.github/workflows/security.yml`](../../.github/workflows/security.yml).
- Process today: the [pull request template](../../.github/pull_request_template.md)
  checklist and impact sections, human code review, and architecture/security
  review (Handbook §13, §14, §20).
- Not yet automated: authorization tests, tenant-isolation tests, accessibility
  validation, performance validation, AI evaluations, and coverage measurement are
  verified by the owning ticket and review until future automation exists. See
  [ENFORCEMENT_MATRIX.md](./ENFORCEMENT_MATRIX.md).

## 8. Exception process

Deviations from this standard are not silent (Constitution §6). Any deviation MUST
record the affected item, the reason, compensating controls, an owner, and an
expiration or remediation plan. A material deviation — anything touching security,
authorization, tenant isolation, data governance, or AI authority — MUST be
captured in an ADR and approved before merge (Handbook §10). Silent exceptions are
prohibited.

## 9. Related Constitution articles

- §5 Constitutional Definition of Done; §3.3 agents may not invent product
  behavior; §6 Exception process.
- Article I — Multi-tenancy; Article II — Auditability; Article III/IV —
  Zero Trust / Deny by default; Article VI — Privacy; Article X/XIII — Explainable
  and safe AI; Article XIV — Accessibility; Article XVI — Testability; Article XVII
  — Observability; Article XVIII — Reliability; Article XXI — Documentation; Article
  XXII — Traceable decisions; Article XXVII — Performance.

See [PlatformTrust Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md).

## 10. Related Handbook sections

- §47 Definition of Done; §13 Pull Request Standards; §14 AI-generated code review;
  §17 Database and Migration Standards; §18 Authentication and Authorization; §19
  Tenant Isolation Testing; §20 Security Engineering; §23 Logging; §25
  Observability; §27 AI Engineering; §28 Testing Strategy; §32 Rollback and
  Recovery; §38 Documentation; §39 Accessibility; §40 Performance.

See [Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md), the standards
[README](./README.md), and the [ENFORCEMENT_MATRIX](./ENFORCEMENT_MATRIX.md).
