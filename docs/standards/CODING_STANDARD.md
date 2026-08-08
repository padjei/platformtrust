# Coding Standard

| Attribute        | Value                                             |
| ---------------- | ------------------------------------------------- |
| Document owner   | PlatformTrust Engineering                         |
| Applies to       | All source, tests, scripts, and tooling in the repository |
| Source issue     | PT-002 §2                                          |
| Precedence       | Below the Constitution, ADRs, security requirements, and the Handbook |

---

## 1. Purpose

This standard translates the PlatformTrust Constitution and Engineering Handbook
into concrete, language-agnostic engineering rules that apply to every application
and package in the repository. It exists so that a reviewer can objectively
determine whether a pull request complies, and so that code stays clear, secure,
and maintainable regardless of who — or what — wrote it.

It restates principles from Handbook §15 (Coding Standards) as enforceable
requirements and links back to the governing articles rather than re-deriving
them. Language-specific rules are deferred to the companion standards; this
document holds the rules common to all of them.

## 2. Scope

This standard applies to:

- All first-party TypeScript, Python, and shell/JS tooling under `apps/*`,
  `packages/*`, `scripts/*`, `infrastructure/*`, and `tests/*`.
- All contributors and coding agents, per Constitution §3.3 and Handbook §3.3.

Language-specific requirements live in and are governed by:

- [TypeScript Standard](./TYPESCRIPT_STANDARD.md)
- [Python Standard](./PYTHON_STANDARD.md)

Where this document and a language standard both speak to a topic, the language
standard adds detail but MUST NOT weaken a rule stated here. This standard does
not define product behavior, data models, permissions, API contracts, or AI
authority; those are owned by the sources named in Constitution §2 and §3.3.

## 3. Mandatory requirements

### 3.1 Clarity and structure

- Code MUST prefer clarity over cleverness. A reviewer unfamiliar with the change
  MUST be able to follow the control flow without running it.
- Functions and modules MUST be small and cohesive: one clear responsibility per
  unit. A function that mixes I/O, business rules, and formatting SHOULD be split.
- Names MUST be explicit and reflect intent. Abbreviations that are not
  domain-standard MUST NOT be introduced.
- Public/exported units SHOULD have signatures that make inputs, outputs, and
  error behavior obvious without reading the body.

### 3.2 Ownership and boundaries

- Every module MUST have a clear owner and a clear boundary; cross-module and
  cross-application access MUST go through explicit, published interfaces
  (Constitution Article XXIII; Handbook §44).
- Cross-application source imports MUST NOT exist. Applications under `apps/*` are
  independent deployables and MUST NOT import another app's source; shared code
  MUST live in an approved `packages/*` library. This is enforced by
  [`scripts/check-app-boundaries.mjs`](../../scripts/check-app-boundaries.mjs)
  (ADR-0001; ADR-0002).
- Dependencies between modules MUST be one-directional. Circular dependencies MUST
  be resolved by extracting the shared concept, not by adding a back-reference.

### 3.3 Failure handling

- Code MUST NOT contain silent failure paths. Every error MUST be handled,
  rethrown with context, or surfaced through a structured error — never swallowed
  (Handbook §24; §15).
- Errors returned to callers or users MUST NOT expose stack traces, secrets,
  internal hostnames, queries, or sensitive configuration (Handbook §24).
- Error-handling detail is governed by the language standards and, where present,
  the Error Handling Standard.

### 3.4 Input trust and data safety

- All external input — client requests, connector data, uploaded files, events,
  environment values, and AI output — MUST be treated as untrusted and validated
  at the boundary before use (Constitution Articles III, V; Handbook §15).
- Secrets, credentials, tokens, PII, or customer data MUST NOT appear in source,
  logs, error messages, test fixtures, comments, or prompts (Constitution Articles
  VI, XIX; Handbook §22, §23, §29).
- Business logic MUST NOT be duplicated. A single rule MUST have a single
  authoritative implementation; shared logic MUST be factored into a shared unit,
  not copy-pasted (Constitution Article VIII; Handbook §15).
- Business logic MUST NOT live only in the frontend (Constitution Article VIII).

### 3.5 Determinism and state

- Where behavior is required to be reproducible (for example, evaluation harnesses
  and any deterministic computation a ticket specifies), code MUST NOT depend on
  wall-clock time, ambient randomness, iteration order, or locale unless that
  input is injected and controllable in tests (Constitution Article XVI).
- Global mutable state MUST be avoided. Shared state MUST be passed explicitly or
  provided through dependency injection to keep units testable (Handbook §15).
- Provider-specific or vendor-specific behavior MUST stay behind an adapter
  interface; core/domain code MUST depend on the interface, not the provider. The
  concrete providers (database, cloud, secret manager, queue, AI model, and
  similar) are deferred to future ADRs and MUST NOT be assumed by name in shared
  code.

### 3.6 Scope discipline and hygiene

- A change MUST stay within the scope of its ticket. Unrelated refactoring MUST
  NOT be mixed into a feature or bug fix (Handbook §12; CLAUDE.md).
- Dead code, unused exports, and commented-out blocks MUST be removed rather than
  left in place. `noUnusedLocals`/`noUnusedParameters` and ESLint `no-unused-vars`
  enforce this for TypeScript; Ruff enforces it for Python.
- Comments MUST explain *why*, not restate *what* the code already says.
  Non-obvious decisions, invariants, and trade-offs SHOULD be documented inline
  or in a linked artifact (Constitution Article XXII; Handbook §15, §38).
- New dependencies MUST NOT be added by this class of change; dependency additions
  follow the Dependency Management standard and Handbook §37 with explicit
  justification.

### 3.7 TODO / FIXME ownership

- A `TODO` or `FIXME` MUST reference a tracking issue and/or a named owner
  (for example, `// TODO(PT-123): ...`). Ownerless, undated markers MUST NOT be
  merged.
- A `TODO` MUST NOT stand in for a missing security control, authorization check,
  tenant-isolation enforcement, or validation. Such gaps MUST block the change,
  not be deferred by a comment (Constitution Articles III, IV, V).
- A feature MUST NOT be declared done while it still contains unresolved
  placeholder `TODO`s for its own required behavior (Constitution §5; Handbook §47).

## 4. Prohibited practices

- MUST NOT commit secrets, credentials, PII, or real customer data anywhere in the
  repository (source, tests, fixtures, docs, comments, prompts).
- MUST NOT import across `apps/*` boundaries or reach into another app's source.
- MUST NOT introduce new product behavior, permissions, tenant rules, API
  contracts, security controls, data-retention rules, or AI authority — these
  require the artifacts in Constitution §3.3.
- MUST NOT swallow errors, return success on failure, or leave empty catch blocks.
- MUST NOT duplicate business logic across modules or applications.
- MUST NOT introduce global mutable state to pass data between units.
- MUST NOT hardcode a specific database, cloud, secret-manager, queue, or AI
  provider into shared/domain code; keep provider specifics behind adapters.
- MUST NOT bundle unrelated refactoring into a feature or fix.
- MUST NOT leave ownerless `TODO`/`FIXME` markers or use them to defer required
  security, authorization, tenancy, or validation.
- MUST NOT weaken, disable, or bypass a lint, type, boundary, or test check to
  make CI pass (Handbook §14; CLAUDE.md).

## 5. Examples

Silent failure versus explicit handling (illustrative, TypeScript):

```ts
// Prohibited: the failure disappears and the caller cannot react.
try {
  await syncConnector(cursor);
} catch {
  // ignored
}

// Required: handle, add context, and rethrow or surface a structured error.
try {
  await syncConnector(cursor);
} catch (error) {
  logger.error('connector.sync_failed', { connectorId, cursor });
  throw new ConnectorSyncError('connector sync failed', { cause: error });
}
```

Owned TODO marker:

```ts
// Prohibited: ownerless and undated.
// TODO: handle pagination

// Required: references a tracked issue and owner.
// TODO(PT-142): handle cursor pagination once the list endpoint is finalized.
```

Provider behavior behind an adapter (illustrative, Python):

```python
# Prohibited: a specific provider leaks into domain code.
def store_evidence(blob: bytes) -> None:
    some_vendor_client().put_object(bucket="evidence", body=blob)


# Required: domain depends on an interface; the provider is chosen elsewhere.
class EvidenceStore(Protocol):
    def put(self, key: str, blob: bytes) -> None: ...


def store_evidence(store: EvidenceStore, key: str, blob: bytes) -> None:
    store.put(key, blob)
```

## 6. Enforcement mechanisms

This standard is enforced by automation and review; a rule without enforcement is
considered incomplete (standards `README.md`).

- Formatting: `pnpm format:check` (Prettier) and, for the AI service,
  `uv run ruff format --check .`.
- Static analysis: `pnpm lint` (ESLint flat config —
  [`eslint.config.mjs`](../../eslint.config.mjs)) and `uv run ruff check .`.
- Type checking: `pnpm typecheck` (strict `tsc` via
  [`tsconfig.base.json`](../../tsconfig.base.json)) and `uv run mypy .`.
- Boundary enforcement: `node scripts/check-app-boundaries.mjs` blocks
  cross-application imports in CI.
- Tests and build: `pnpm test`, `pnpm build`, and `uv run pytest`.
- Pre-commit hooks (Husky + lint-staged) and pull-request review per Handbook §13
  and §14 (AI-generated code reviewed as untrusted).

## 7. Exception process

Deviations from this standard are not silent (Constitution §6). Any deviation MUST
be documented and escalated: it MUST record the affected rule, the reason, the
compensating controls, an owner, and an expiration or remediation plan. A material
deviation — anything touching security, authorization, tenant isolation, data
governance, or AI authority — MUST be captured in an ADR and approved through the
process in Handbook §10 before merge. Silent exceptions are prohibited.

## 8. Related Constitution articles

- Article III — Zero Trust; Article IV — Deny by Default; Article V — Security Is a
  Product Requirement (untrusted input, secrets, failure behavior).
- Article VI — Privacy and Data Minimization; Article XIX — Infrastructure and
  secrets never in source.
- Article VIII — APIs Are Versioned Contracts; logic not only in the frontend.
- Article XVI — Testability; Article XXII — Traceable decisions; Article XXIII —
  Domain ownership.
- §2 Precedence; §3.3 agents may not invent product behavior; §5 Definition of
  Done; §6 Exception process.

See [PlatformTrust Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md).

## 9. Related Handbook sections

- §5 Repository Structure; §12 Commit Standards; §13 Pull Request Standards;
  §14 AI-generated code review; §15 Coding Standards; §24 Error Handling;
  §37 Dependency Management; §38 Documentation; §44 Service Ownership; §47
  Definition of Done.

See [Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md), the accepted
[ADR-0001](../adr/ADR-0001-use-platformtrust-monorepo.md) and
[ADR-0002](../adr/ADR-0002-initial-application-technology-stack.md), and the
companion [TypeScript Standard](./TYPESCRIPT_STANDARD.md) and
[Python Standard](./PYTHON_STANDARD.md).
