# @platformtrust/shared

Domain-agnostic shared primitives for the PlatformTrust monorepo.

## Purpose and boundary

This package holds the small set of **generic, non-domain** building blocks that
every layer may safely depend on:

- **Service & version constants** — stable identifiers for the deployable units
  and the shared contract/package versions.
- **`Result<T, E>`** — a plain discriminated-union type for modelling success or
  failure, with `ok` / `err` constructors and `isOk` / `isErr` type guards.
- **Pure utilities** — deterministic helpers (`isEmpty`, `chunk`, `unique`,
  `truncate`, `assertDefined`).

## What it must NOT contain

- No business or domain logic (no readiness scoring, tenancy rules, connector or
  event-schema knowledge).
- No I/O, no wall-clock, no randomness — utilities are pure and deterministic.
- No `any`; everything is fully typed.

Domain-specific types belong in dedicated packages (e.g. `shared-types`,
`event-schema`), not here.

## Exports

| Export                                                    | Kind         | Description                    |
| --------------------------------------------------------- | ------------ | ------------------------------ |
| `SERVICE_NAMES`, `ServiceName`                            | const / type | Canonical service identifiers  |
| `SHARED_PACKAGE_VERSION`, `SHARED_CONTRACT_VERSION`       | const        | Version markers                |
| `Result`, `Ok`, `Err`                                     | type         | Generic outcome type           |
| `ok`, `err`, `isOk`, `isErr`                              | fn           | Result constructors and guards |
| `isEmpty`, `chunk`, `unique`, `truncate`, `assertDefined` | fn           | Pure utilities                 |

## Usage

```ts
import { ok, err, isOk, type Result } from '@platformtrust/shared';

function parsePort(raw: string): Result<number, string> {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? ok(n) : err(`invalid port: ${raw}`);
}

const r = parsePort('8080');
if (isOk(r)) {
  console.log(r.value);
}
```

## Testing

Unit tests live alongside the source (`src/**/*.test.ts`) and run with Vitest:

```bash
pnpm --filter @platformtrust/shared test
```
