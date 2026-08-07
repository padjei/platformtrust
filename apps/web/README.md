# @platformtrust/web

The PlatformTrust web surface — a Next.js (App Router) + TypeScript application.
This is the minimal landing shell for the AI Readiness Auditor MVP (PT-001 FR-005).

It renders the product name, a platform-initialization message, and safe
build/environment information, and exposes a machine-readable health endpoint.

## Requirements

- Node 22
- pnpm 9

Install dependencies from the repository root (`pnpm install`); this app is part
of the pnpm/Turborepo workspace and depends on `@platformtrust/ui` and
`@platformtrust/shared` via `workspace:*`.

## Scripts

Run from `apps/web/` (or via Turborepo from the repo root):

| Script               | Description                                        |
| -------------------- | -------------------------------------------------- |
| `pnpm dev`           | Start the dev server (`WEB_PORT`, default `3000`). |
| `pnpm build`         | Production build (`next build`).                   |
| `pnpm start`         | Serve the production build (`next start`).         |
| `pnpm lint`          | Lint with `next lint`.                             |
| `pnpm typecheck`     | Strict TypeScript check (`tsc --noEmit`).          |
| `pnpm test`          | Run unit tests (Vitest).                           |
| `pnpm test:coverage` | Run unit tests with V8 coverage.                   |
| `pnpm clean`         | Remove build/coverage artifacts.                   |

## Local development

```bash
pnpm dev
# open http://localhost:3000
```

Set `WEB_PORT` to change the port, e.g. `WEB_PORT=4000 pnpm dev`.

## Health endpoint

A machine-readable health check is served by a Route Handler at:

```
GET /health
```

It returns HTTP `200` with a JSON body:

```json
{
  "status": "ok",
  "service": "platformtrust-web",
  "version": "0.1.0",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

The endpoint exposes only safe status information — no secrets, host details, or
internal configuration. The Vitest suite (`tests/health.test.ts`) imports the
`GET` handler directly and asserts the status and JSON shape, so no running
server is required to test it.

## Structure

- `src/app/layout.tsx` — root layout (`lang="en"`, semantic HTML).
- `src/app/page.tsx` — landing shell (uses the shared `Button` primitive).
- `src/app/health/route.ts` — health Route Handler (`GET`).
- `src/app/globals.css` — minimal global styles.
- `tests/health.test.ts` — Vitest unit test for the health handler.
