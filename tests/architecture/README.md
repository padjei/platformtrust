# Architecture tests

These checks enforce PlatformTrust's structural invariants so the codebase stays a
clean modular system rather than an entangled one.

## Application boundary check

Script: [`scripts/check-app-boundaries.mjs`](../../scripts/check-app-boundaries.mjs)

Run it:

```bash
node scripts/check-app-boundaries.mjs
```

It also runs automatically in CI (the TypeScript job in
[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)).

### What it enforces

Each application under `apps/*` (`web`, `api`, `worker`, `ai-service`) is an
independent deployable. Applications:

- **MAY** import shared libraries from `packages/*`, published as
  `@platformtrust/<pkg>` (e.g. `@platformtrust/shared`, `@platformtrust/auth`).
- **MUST NOT** import from another application's source. Specifically, the check
  fails on:
  1. Importing another app's package name as if it were a library
     (e.g. `@platformtrust/api` from within `apps/web`).
  2. A path specifier that reaches into a sibling app (e.g. `apps/api/...`).
  3. A relative import that resolves into another app's directory
     (e.g. `../../api/src/...`).

The scanner reads `.ts` / `.tsx` files under each app's `src/`, `app/`, and
`tests/` directories and inspects `import`, `export ... from`, dynamic
`import()`, and `require()` specifiers.

### Result

- Exit code `0` and a success message when no cross-application imports exist.
- Exit code `1` with a list of every offending file, specifier, and reason
  otherwise.

If two applications genuinely need to share code, extract it into a package under
`packages/*` and depend on it via `@platformtrust/<pkg>` — do not import across
app boundaries.
