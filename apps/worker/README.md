# @platformtrust/worker

The PlatformTrust background worker, built as a **NestJS standalone application**
(`NestFactory.createApplicationContext`). It runs **no HTTP server**.

This slice (PT-001, FR-007) provides the worker bootstrap and operational
scaffolding only: configuration validation, structured startup logging, graceful
shutdown, and an internal, unit-testable health-state provider. Actual jobs,
consumers, schedules, and queues are added in later issues.

## Runtime behavior

- **Standalone context**: created with `NestFactory.createApplicationContext` —
  no network listener is opened.
- **Config validation**: environment variables are validated at startup with a
  Zod schema (`@nestjs/config` `validate` hook). Invalid config fails fast.
- **Graceful shutdown**: `enableShutdownHooks()` runs module lifecycle hooks; an
  explicit `SIGINT`/`SIGTERM` handler logs the signal, closes the application
  context, and exits with the appropriate code. Shutdown is guarded so it runs
  once.
- **Logging**: a tiny dependency-free JSON logger emits one structured line per
  event (startup, shutdown, errors). No secrets, hostnames, or stack traces are
  exposed.

## Health state

The worker exposes an internal `WorkerHealthService` provider (not over any
network transport). `getHealth()` returns:

```json
{
  "status": "ok",
  "service": "platformtrust-worker",
  "version": "0.1.0"
}
```

It exposes no secrets, hostnames, or internal configuration.

## Configuration

Non-secret settings only. Secrets are loaded at runtime from the platform secret
manager, never from source control.

- `NODE_ENV` — `development` | `test` | `production` (default `development`).
- `LOG_LEVEL` — `debug` | `info` | `warn` | `error` (default `info`).

## Commands

Run from this directory (or via Turborepo from the repo root):

```bash
pnpm build          # tsc -p tsconfig.build.json  -> dist/
pnpm start          # node dist/main.js
pnpm start:dev      # build, then run with node --watch
pnpm lint           # eslint .
pnpm typecheck      # tsc --noEmit -p tsconfig.json
pnpm test           # vitest run
pnpm test:coverage  # vitest run --coverage
pnpm clean          # remove dist / coverage / .turbo
```

## Tests

- `test/worker-health.service.spec.ts` — asserts the health-state shape and
  worker service name, both directly and via NestJS dependency injection.

Vitest uses `unplugin-swc` so TypeScript decorators and emitted metadata work
for NestJS dependency injection.

## TypeScript strictness

This app extends the repository base `tsconfig` and keeps `strict: true`. It
overrides only the runtime-oriented options required by NestJS/Node (CommonJS
module + Node resolution, `emitDecoratorMetadata`, `experimentalDecorators`,
`outDir`/`rootDir`, emit enabled). **No strictness relaxations were needed** —
`exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` remain enabled.
