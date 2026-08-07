# @platformtrust/api

The PlatformTrust HTTP API application, built with **NestJS** on
`@nestjs/platform-express`.

This slice (PT-001, FR-006) provides the application bootstrap and operational
scaffolding only: configuration validation, request correlation, centralized
error handling, structured logging, graceful shutdown, and a health endpoint.
Domain modules (readiness, connectors, tenancy, audit, etc.) are added in later
issues.

## Runtime behavior

- **Global prefix**: all routes are served under `/api`.
- **Versioning**: URI versioning with default version `1`, so routes live under
  `/api/v1`.
- **Correlation id**: every request gets an `x-request-id`. An inbound
  `x-request-id` header is reused; otherwise a UUID (`node:crypto.randomUUID`)
  is generated. The value is echoed on the response header and included in the
  health and error responses.
- **Centralized errors**: a global exception filter returns a structured JSON
  error and never leaks stack traces or internal details. Server-side (5xx)
  messages are replaced with a generic message when `NODE_ENV=production`. Full
  error context (including the stack) is logged server-side only.
- **Config validation**: environment variables are validated at startup with a
  Zod schema (`@nestjs/config` `validate` hook). Invalid config fails fast.
- **Graceful shutdown**: `enableShutdownHooks()` is enabled so module lifecycle
  hooks run on `SIGTERM`/`SIGINT`.
- **Logging**: a tiny dependency-free JSON logger emits one structured line per
  event (startup, errors). No secrets, hostnames, or stack traces are exposed to
  clients.

## Health endpoint

`GET /api/v1/health` returns `200` with this exact shape (no database checks, no
secrets, no host/stack/internal config):

```json
{
  "status": "ok",
  "service": "platformtrust-api",
  "version": "0.1.0",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "requestId": "b1e0c2a4-..."
}
```

`timestamp` (ISO-8601) and `requestId` are dynamic.

## Configuration

Non-secret settings only. Secrets are loaded at runtime from the platform secret
manager, never from source control.

- `NODE_ENV` — `development` | `test` | `production` (default `development`).
- `LOG_LEVEL` — `debug` | `info` | `warn` | `error` (default `info`).
- `API_PORT` — integer 1-65535 (default `3001`). The port the HTTP server binds.
- `PORT` — integer 1-65535, optional. `API_PORT` takes precedence when both are set.

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

- `test/health.spec.ts` — e2e (supertest) asserting the exact health shape,
  service name, and request-id echo/generation behavior.
- `test/request-id.middleware.spec.ts` — unit tests for the correlation-id
  middleware.

Vitest uses `unplugin-swc` so TypeScript decorators and emitted metadata work
for NestJS dependency injection.

## TypeScript strictness

This app extends the repository base `tsconfig` and keeps `strict: true`. It
overrides only the runtime-oriented options required by NestJS/Node (CommonJS
module + Node resolution, `emitDecoratorMetadata`, `experimentalDecorators`,
`outDir`/`rootDir`, emit enabled). **No strictness relaxations were needed** —
`exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` remain enabled.
