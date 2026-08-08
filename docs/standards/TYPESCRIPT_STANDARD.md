# TypeScript Standard

| Attribute        | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| Document owner   | PlatformTrust Engineering                                      |
| Applies to       | All TypeScript in `apps/web`, `apps/api`, `apps/worker`, `packages/*`, and TS tooling |
| Source issue     | PT-002 §3                                                       |
| Precedence       | Below the Constitution, ADRs, security requirements, and the Handbook |

---

## 1. Purpose

This standard defines the concrete TypeScript rules for PlatformTrust. It builds on
the repository-wide [Coding Standard](./CODING_STANDARD.md) and the strict compiler
and lint configuration already committed to the repository, turning them into
review-checkable requirements. It exists so that TypeScript across the web, API,
worker, and shared packages is type-safe, boundary-safe, and consistent.

## 2. Scope

This standard applies to all `.ts` and `.tsx` files in TypeScript applications and
packages: `apps/web` (Next.js), `apps/api` and `apps/worker` (NestJS), and
`packages/*`. It complements, and MUST NOT weaken, the Coding Standard. It does not
select a database, ORM, auth provider, cloud, secret manager, queue, or AI
provider — those remain deferred to future ADRs (ADR-0002). It does not define
product modules, API contracts, permissions, or data models; those are owned per
Constitution §3.3.

## 3. Mandatory requirements

### 3.1 Strict typing

- Every TypeScript project MUST extend the root
  [`tsconfig.base.json`](../../tsconfig.base.json) and MUST NOT relax its strict
  flags. The following MUST remain in effect: `strict`,
  `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`,
  `forceConsistentCasingInFileNames`, `useUnknownInCatchVariables`,
  `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, and
  `noImplicitReturns` (ADR-0002).
- `pnpm typecheck` MUST pass with no errors and no new suppressions.

### 3.2 `any`, `unknown`, and assertions

- `any` MUST NOT be used. The single permitted exception is a genuine external
  boundary where a type cannot yet be known; such use MUST be narrowly scoped,
  paired with an ESLint-disable that names the reason, and immediately narrowed to
  a real type. It MUST NOT be used to suppress a design or type problem
  (CLAUDE.md; Handbook §14).
- Untrusted or unknown values MUST be typed as `unknown` and narrowed through
  validation or type guards before use.
- Non-null assertions (`!`) and `as` type assertions MUST NOT be used to bypass the
  type system. Prefer narrowing, guards, or schema validation. A `@ts-expect-error`
  MAY be used only with an inline explanation and a linked issue.

### 3.3 Runtime validation at boundaries

- All data crossing a trust boundary — HTTP request bodies, query and path params,
  headers, connector payloads, events, environment configuration, and any parsed
  JSON — MUST be validated at runtime and narrowed from `unknown` before use
  (Constitution Articles III, V; Handbook §15). Compile-time types alone are not
  sufficient at boundaries.
- The validated schema SHOULD be the single source of truth for the type (infer the
  type from the schema rather than declaring it twice).
- Tenant identifiers MUST NOT be read from client-supplied input; they are derived
  from the authenticated context server-side (Constitution Article I).

### 3.4 Function and API shape

- Exported/public functions, and any function whose inferred return type is
  non-obvious, MUST declare an explicit return type.
- Stateful values and operation results with more than one outcome MUST be modeled
  with discriminated unions rather than optional-field grab-bags, so that the
  compiler forces exhaustive handling.
- `switch` over a discriminant SHOULD include an exhaustiveness check (a `never`
  default) so that adding a variant is a compile error.

### 3.5 Module boundaries and imports

- Cross-application source imports MUST NOT exist. An app MUST NOT import from
  another app's source, from `@platformtrust/<appname>`, or via an
  `apps/<other>/...` path specifier. Shared code MUST live in an approved
  `packages/*` library published as `@platformtrust/<pkg>`. Enforced by
  [`scripts/check-app-boundaries.mjs`](../../scripts/check-app-boundaries.mjs)
  (ADR-0001; ADR-0002).
- Type-only imports MUST use `import type` (enforced by
  `@typescript-eslint/consistent-type-imports` in
  [`eslint.config.mjs`](../../eslint.config.mjs)).
- Unused imports, locals, and parameters MUST be removed; intentionally unused
  parameters MUST be prefixed with `_` per the ESLint config.

### 3.6 Errors and async

- Caught errors are typed `unknown` (`useUnknownInCatchVariables`) and MUST be
  narrowed before their properties are accessed. Errors MUST NOT be swallowed;
  handle, rethrow with context, or surface a structured error (Handbook §24).
- Promises MUST NOT float: every promise MUST be awaited, returned, or explicitly
  handled with `.catch`. Fire-and-forget async work MUST be routed through the
  worker or an explicitly documented, error-handled path.
- `async` functions MUST NOT be passed where a synchronous callback is expected in
  a way that discards rejections.

### 3.7 Framework discipline

- NestJS (`apps/api`, `apps/worker`): controllers MUST stay thin — validate input,
  resolve the authenticated tenant/auth context, delegate to a service, and
  serialize the response. Business logic MUST live in services/providers, wired
  through Nest dependency injection, and modules MUST expose capabilities through a
  thin service layer rather than reaching into another module's internals. This
  guidance MUST NOT be used to invent product modules or endpoints (Constitution
  §3.3; ADR-0002).
- Next.js (`apps/web`): components MUST be Server Components by default; a component
  MUST be marked `'use client'` only when it needs interactivity, browser APIs, or
  client state. Secrets, service credentials, and privileged tokens MUST NOT reach
  client components, the bundle, or `NEXT_PUBLIC_*` variables (Constitution Article
  XIX). Privileged actions MUST call the backend, which enforces authorization and
  tenant scope server-side (Constitution Articles III, IV, VIII).

### 3.8 Testing

- New and changed TypeScript behavior MUST ship with Vitest tests, and `pnpm test`
  MUST pass (ADR-0002; Constitution Article XVI).
- Tests MUST be deterministic — no reliance on real network, wall-clock, or ambient
  randomness; inject and control such inputs (Handbook §28, §29).
- Tests MUST NOT contain secrets or real customer data; use synthetic fixtures, and
  include negative authorization and tenant-isolation cases where the code is
  tenant-owned (Handbook §19, §29). Detailed testing rules are governed by the
  [Testing Standard](./TESTING_STANDARD.md).

## 4. Prohibited practices

- MUST NOT use `any`, non-null assertions, or `as` casts to bypass the type system.
- MUST NOT relax or override the strict flags from `tsconfig.base.json`.
- MUST NOT consume boundary input without runtime validation and narrowing.
- MUST NOT read `tenant_id` (or equivalent) from client input.
- MUST NOT import across `apps/*` boundaries or treat an app as a library.
- MUST NOT leave floating promises or swallow caught errors.
- MUST NOT put business logic in NestJS controllers or in Next.js client
  components, and MUST NOT expose secrets to the browser.
- MUST NOT introduce product modules, endpoints, permissions, or data contracts not
  defined by the ticket, Constitution, Handbook, or ADRs.
- MUST NOT add new dependencies without Handbook §37 justification.

## 5. Examples

`unknown` at a boundary, then narrow (illustrative):

```ts
import { z } from 'zod';

const CreateAssessmentInput = z.object({
  name: z.string().min(1),
  domainId: z.string().uuid(),
});
type CreateAssessmentInput = z.infer<typeof CreateAssessmentInput>;

// `body` arrives as unknown from the boundary; validate before use.
function parseCreate(body: unknown): CreateAssessmentInput {
  return CreateAssessmentInput.parse(body);
}
```

Discriminated union with exhaustive handling:

```ts
type FetchResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

function render<T>(result: FetchResult<T>): string {
  switch (result.status) {
    case 'ok':
      return 'ok';
    case 'not_found':
      return 'missing';
    case 'error':
      return result.message;
    default: {
      const _exhaustive: never = result;
      return _exhaustive;
    }
  }
}
```

Type-only import and no floating promise:

```ts
import type { Logger } from './logger';

async function run(logger: Logger, task: () => Promise<void>): Promise<void> {
  await task(); // awaited, not floated
  logger.info('task.completed');
}
```

## 6. Enforcement mechanisms

- `pnpm format:check` (Prettier) and `pnpm lint` (ESLint flat config with
  `typescript-eslint`, `no-unused-vars`, `consistent-type-imports`, and
  `eslint-config-prettier`).
- `pnpm typecheck` runs strict `tsc` against `tsconfig.base.json`.
- `node scripts/check-app-boundaries.mjs` blocks cross-application imports in CI.
- `pnpm test` (Vitest) and `pnpm build`.
- Husky + lint-staged pre-commit hooks and pull-request review (Handbook §13, §14).

## 7. Exception process

Deviations are never silent (Constitution §6). A documented `any` boundary
exception MUST name its reason inline and be scoped and narrowed; broader
deviations MUST be documented with rationale, compensating controls, owner, and an
expiration or remediation plan, and escalated. A material deviation — anything
affecting security, authorization, tenant isolation, API contracts, or AI
authority — MUST be captured in an ADR and approved per Handbook §10 before merge.

## 8. Related Constitution articles

- Article I — Multi-tenancy (tenant context server-side); Article III — Zero Trust;
  Article IV — Deny by Default; Article V — Security Is a Product Requirement.
- Article VIII — APIs Are Versioned Contracts; logic not only in the frontend.
- Article XVI — Testability; Article XIX — secrets never in source; Article XXIII —
  Domain ownership.
- §2 Precedence; §3.3 agents may not invent product behavior; §6 Exception process.

See [PlatformTrust Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md).

## 9. Related Handbook sections

- §5 Repository Structure; §14 AI-generated code review; §15 Coding Standards;
  §16 API Standards; §24 Error Handling; §28 Testing Strategy; §29 Test Data;
  §37 Dependency Management.

See [Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md),
[ADR-0001](../adr/ADR-0001-use-platformtrust-monorepo.md),
[ADR-0002](../adr/ADR-0002-initial-application-technology-stack.md), the
repository-wide [Coding Standard](./CODING_STANDARD.md), and the
[Python Standard](./PYTHON_STANDARD.md).
