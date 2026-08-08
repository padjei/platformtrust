# @platformtrust/config

Shared configuration metadata for the PlatformTrust monorepo.

## Purpose and boundary

This package is a tiny, dependency-light helper that describes **where the
shared tooling configuration lives** — the base TypeScript config, the flat
ESLint config, and the Prettier config at the repository root. It lets packages
and apps reference those locations through typed constants instead of scattering
relative-path literals across the codebase.

It contains **no business logic** and no runtime side effects.

## What it exports

- `BASE_TSCONFIG_RELATIVE_PATH` — relative path from a first-level workspace
  package (e.g. `packages/<name>`) to `tsconfig.base.json`.
- `SHARED_ESLINT_CONFIG_FILENAME` — filename of the shared flat ESLint config.
- `SHARED_PRETTIER_CONFIG_FILENAME` — filename of the shared Prettier config.
- `SharedConfigMetadata` (interface) and `sharedConfigMetadata` (frozen value) —
  a structured view of the above.
- `resolveBaseTsconfigPath(depthFromRoot?)` — computes the relative path to the
  base tsconfig for a package nested `depthFromRoot` levels below the repo root
  (defaults to `2`).

## What it is NOT

- Not an ESLint/Prettier/TypeScript config generator or preset. The canonical
  shared configs remain the root `eslint.config.mjs`, `.prettierrc.json`, and
  `tsconfig.base.json`, which every package extends directly.
- Not a place for environment variables, secrets, or runtime application config.

## Usage

```ts
import { resolveBaseTsconfigPath, sharedConfigMetadata } from '@platformtrust/config';

const basePath = resolveBaseTsconfigPath(); // '../../tsconfig.base.json'
console.log(sharedConfigMetadata.eslintConfigFilename); // 'eslint.config.mjs'
```
