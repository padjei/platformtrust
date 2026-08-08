# Testing Standard

| Attribute        | Value                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| Document owner   | PlatformTrust Engineering                                                  |
| Approver         | Product and Engineering Leadership                                         |
| Classification   | Internal                                                                   |
| Related issue    | PT-002 §6                                                                  |
| Applies to       | All PlatformTrust application, worker, AI-service, and package code        |

---

## 1. Purpose

This standard defines how PlatformTrust code is tested so that behavior can be
verified consistently and a reviewer can confirm that a change carries adequate,
meaningful tests.

It operationalizes the Constitution's testability mandate — "a requirement that
cannot be tested is not sufficiently defined"
([Article XVI](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvi--everything-must-be-testable)) —
and the Handbook's layered testing strategy
([§28](../handbook/ENGINEERING_HANDBOOK.md#28-testing-strategy)).

## 2. Scope

This standard applies to all first-party code:

- TypeScript apps and packages (`apps/web`, `apps/api`, `apps/worker`,
  `packages/*`) tested with **Vitest**.
- The Python AI service (`apps/ai-service`) tested with **Pytest**.

It defines the required test layers, what must be real versus mocked,
determinism and test-data rules, regression and flaky-test policy, naming
conventions, and required local/CI behavior. It does **not** set code-coverage
percentage thresholds (see [§10](#10-code-coverage)).

## 3. Mandatory requirements

### 3.1 Test layers (the testing pyramid)

Every feature MUST be covered by the appropriate combination of the layers below
([Article XVI](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvi--everything-must-be-testable);
[Handbook §28](../handbook/ENGINEERING_HANDBOOK.md#28-testing-strategy)). Not
every layer applies to every change, but material behavior MUST NOT ship
untested.

| Layer                    | Validates                                                            | Required when                                             |
| ------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------- |
| Unit                     | Isolated logic in one unit, no external I/O                          | Always, for any non-trivial logic                        |
| Integration              | Collaboration across components and real boundaries                 | A change crosses a component, service, or data boundary  |
| Contract                 | API and event shapes between producer and consumer                  | An API or event contract is added or changed             |
| End-to-end (e2e)         | Critical user workflows through the running system                   | A critical user-facing flow is added or changed          |
| Security / authorization | AuthN/authZ, input handling, abuse resistance, deny-by-default       | Any protected action or input boundary is touched        |
| Tenant-isolation (neg.)  | Tenant A cannot reach Tenant B data or identifiers                   | Mandatory once tenant-owned data exists (see [§3.2](#32-tenant-isolation-negative-tests-mandatory)) |
| Accessibility            | Keyboard, screen-reader, contrast, error/loading/empty states       | User-facing UI is added or changed                       |
| Performance              | Latency, throughput, and stability under expected load              | When the ticket defines a performance requirement        |
| AI evaluation            | Probabilistic AI behavior against approved datasets                 | When an AI feature is added or its model/prompt changes  |

- The distribution SHOULD follow a pyramid: many fast unit tests, fewer
  integration/contract tests, and a focused set of e2e tests.
- Base layers (unit, integration) MUST NOT be skipped in favor of e2e coverage
  alone.

### 3.2 Tenant-isolation negative tests (mandatory)

- Once a feature stores or reads tenant-owned data, it MUST include **negative**
  tenant-isolation tests. **Positive tests alone are insufficient**
  ([Handbook §19](../handbook/ENGINEERING_HANDBOOK.md#19-tenant-isolation-testing)).
- Negative tests MUST assert, where applicable, that Tenant A cannot read,
  modify, reference, or export Tenant B's data or identifiers, that background
  jobs do not cross tenants, and that a tenant identifier supplied by the client
  cannot override the authenticated tenant
  ([Article I](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-i--multi-tenancy-is-mandatory)).
- Authorization-failure tests MUST assert that unauthorized actors are denied
  (deny-by-default), not merely that authorized actors succeed.

### 3.3 What is real versus mocked

- Unit tests MUST NOT perform real network, filesystem, clock, or database I/O;
  such boundaries MUST be substituted with fakes or in-memory doubles.
- Integration tests MUST exercise real boundaries relevant to the change (for
  example a real HTTP layer, a real data-access layer once persistence exists, or
  a real message path), rather than mocking the boundary under test.
- The AI model provider MUST be mocked/faked in unit and integration tests;
  probabilistic model behavior is validated separately by AI evaluations
  ([§3.1](#31-test-layers-the-testing-pyramid);
  [`AI_ENGINEERING_STANDARD.md`](./AI_ENGINEERING_STANDARD.md)).
- Tests MUST NOT depend on third-party live services or the public internet.
- A component MUST NOT be mocked in the same test that is meant to verify that
  component's own behavior.

### 3.4 Deterministic tests

- Tests MUST be deterministic: the same inputs MUST produce the same result on
  every run and in any order.
- Tests MUST NOT depend on wall-clock time, real timers, ambient time zones, or
  unseeded randomness. Time MUST be frozen or injected, and randomness MUST be
  seeded or stubbed.
- Tests MUST NOT depend on execution order or on shared mutable state left by
  another test; each test MUST set up and tear down its own state.
- Tests MUST NOT rely on real-time `sleep` for synchronization; use fake timers
  or explicit awaits.

### 3.5 Synthetic test data

- Test data MUST be synthetic. Real customer data, production data, real PII, and
  real secrets MUST NOT appear in fixtures, snapshots, or assertions
  ([Article VI](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-vi--privacy-and-data-minimization);
  [Handbook §29](../handbook/ENGINEERING_HANDBOOK.md#29-test-data)).
- Fixtures SHOULD represent multiple tenants and MUST include negative-
  authorization scenarios, boundary values, and failure scenarios.
- Shared test state MUST be documented and reproducible; tests MUST NOT rely on
  undocumented permanent environment state.

### 3.6 Regression tests

- Every bug fix MUST ship with a regression test that fails against the old
  behavior and passes with the fix
  ([Article XVI](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvi--everything-must-be-testable)).
- Assertions MUST NOT be weakened to accommodate a defect; the code MUST be
  fixed instead.

### 3.7 Flaky-test policy

- A test that passes and fails without a code change is flaky and MUST be either
  fixed or quarantined with a tracking issue and an owner. It MUST NOT be left to
  fail intermittently in CI.
- Quarantine MUST be temporary and tracked; a quarantined test MUST NOT be
  deleted to make CI green.
- Tests MUST NOT be disabled, skipped, `xfail`ed, or `.only`/`.skip`-toggled
  simply to pass a build.

### 3.8 Test naming conventions

- Test names MUST describe the behavior under test and the expected outcome, not
  the implementation. A "given/when/then" or "does X when Y" phrasing is
  RECOMMENDED (for example `denies cross-tenant read when tenant differs`).
- TypeScript test files MUST use the `*.test.ts` / `*.test.tsx` suffix and live
  beside the code or in a co-located `__tests__` directory per app convention.
- Python test files MUST match Pytest discovery (`test_*.py`) with `test_*`
  functions.
- Security, authorization, and tenant-isolation tests SHOULD be named so they are
  identifiable as such (for example a `tenant-isolation` or `authz` descriptor).

### 3.9 Required local and CI behavior

- TypeScript tests MUST run under **Vitest** via `pnpm test`. AI-service tests
  MUST run under **Pytest** via `uv run pytest`.
- All test suites MUST pass locally before a change is proposed and MUST pass in
  CI before merge ([Handbook §13](../handbook/ENGINEERING_HANDBOOK.md#13-pull-request-standards)).
- Tests MUST run alongside formatting, linting, and type checking; a green test
  run with failing lint or type checks is not a passing state.

## 4. Prohibited practices

- MUST NOT ship a tenant-owned feature without negative tenant-isolation tests.
- MUST NOT rely on positive tests alone for isolation or authorization.
- MUST NOT disable, skip, `xfail`, comment out, or narrow tests to force a green
  build.
- MUST NOT weaken an assertion to tolerate a bug.
- MUST NOT use real customer data, production data, real PII, or real secrets in
  tests.
- MUST NOT depend on wall-clock time, unseeded randomness, execution order, or
  real network access.
- MUST NOT mock the exact component a test is meant to verify.
- MUST NOT establish a code-coverage percentage threshold without evidence and an
  approved change (see [§10](#10-code-coverage)).

## 5. Examples

### 5.1 Deterministic time (TypeScript / Vitest)

```ts
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

it('stamps createdAt in UTC from the frozen clock', () => {
  expect(newRecord().createdAt).toBe('2026-01-01T00:00:00.000Z');
});
```

### 5.2 Tenant-isolation negative test (TypeScript / Vitest)

```ts
it('denies cross-tenant read when the resource belongs to another tenant', async () => {
  const tenantA = principalFor('tenant-a');
  const resource = await createResource(principalFor('tenant-b'));

  await expect(readResource(tenantA, resource.id)).rejects.toThrow(ForbiddenError);
});
```

### 5.3 Authorization-failure test (Python / Pytest)

```python
import pytest


def test_denies_action_for_unauthorized_role(client, viewer_token):
    response = client.post(
        "/api/v1/admin/settings",
        headers={"Authorization": f"Bearer {viewer_token}"},
        json={"key": "value"},
    )
    assert response.status_code == 403
```

## 6. Enforcement mechanisms

- **CI (`.github/workflows/ci.yml`):** `pnpm test` (Vitest) and, for
  `apps/ai-service`, `uv run pytest`, alongside `pnpm format:check`,
  `pnpm lint`, `pnpm typecheck`, `pnpm build`, and
  `node scripts/check-app-boundaries.mjs`.
- **Pull request review** using `.github/pull_request_template.md` — reviewers
  MUST confirm the "Tests performed" section covers the required layers,
  including tenant-isolation and authorization-failure coverage where relevant
  ([Handbook §13](../handbook/ENGINEERING_HANDBOOK.md#13-pull-request-standards),
  [§14](../handbook/ENGINEERING_HANDBOOK.md#14-code-review-guidance-for-ai-generated-code)).
- **Definition of Done** requires passing unit, integration, tenant-isolation,
  and (where applicable) e2e and AI-evaluation tests
  ([Handbook §47](../handbook/ENGINEERING_HANDBOOK.md#47-definition-of-done)).

## 7. Exception process

Exceptions MUST follow the no-silent-exceptions rule in
[Constitution §6](../constitution/PLATFORMTRUST_CONSTITUTION.md#6-exception-process):
explicit, temporary, documented, with the rule affected, justification,
compensating controls, owner, approver, expiration, and remediation plan. A
quarantined flaky test is a temporary, tracked exception, not a silent one.
Silent exceptions are prohibited.

## 8. Related Constitution articles

- [Article I — Multi-Tenancy](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-i--multi-tenancy-is-mandatory)
- [Article XVI — Everything Must Be Testable](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvi--everything-must-be-testable)
- [Article VI — Privacy and Data Minimization](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-vi--privacy-and-data-minimization)
- [Article XIII — AI Must Fail Safely](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xiii--ai-must-fail-safely)

## 9. Related Handbook sections

- [§19 — Tenant Isolation Testing](../handbook/ENGINEERING_HANDBOOK.md#19-tenant-isolation-testing)
- [§28 — Testing Strategy](../handbook/ENGINEERING_HANDBOOK.md#28-testing-strategy)
- [§29 — Test Data](../handbook/ENGINEERING_HANDBOOK.md#29-test-data)
- [§13 — Pull Request Standards](../handbook/ENGINEERING_HANDBOOK.md#13-pull-request-standards)
- [§47 — Definition of Done](../handbook/ENGINEERING_HANDBOOK.md#47-definition-of-done)

## 10. Code coverage

- This standard **does not** establish a code-coverage percentage threshold.
  Coverage percentage MUST NOT be treated as a merge gate under this standard.
- Coverage is a diagnostic signal, not a goal: a high percentage does not prove
  the required layers (especially tenant-isolation and authorization-failure
  tests) exist, and meaningful tests matter more than a number.
- Introducing a coverage threshold would require **evidence** that it improves
  quality and an **approved change** to this standard through the exception or
  amendment process ([§7](#7-exception-process);
  [Constitution §6](../constitution/PLATFORMTRUST_CONSTITUTION.md#6-exception-process)).

## 11. Related standards and ADRs

- [`SECURE_CODING_STANDARD.md`](./SECURE_CODING_STANDARD.md)
- [`ERROR_HANDLING_STANDARD.md`](./ERROR_HANDLING_STANDARD.md)
- [`AI_ENGINEERING_STANDARD.md`](./AI_ENGINEERING_STANDARD.md)
- [ADR-0002 — Initial Application Technology Stack](../adr/ADR-0002-initial-application-technology-stack.md)
</content>
