# @platformtrust/web

Next.js (App Router) frontend for the AI PlatformTrust Trust Operations Platform.

## Stack

React + TypeScript + Tailwind + shadcn/ui + TanStack Query + React Hook Form + Zod.

## Running

```bash
npm install
npm run dev        # start dev server on http://localhost:3000
npm run build      # production build
npm run start      # serve production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run test       # Playwright tests
```

## Notes

- Server components by default; opt into client components only where needed.
- All API calls go through the `services/api` FastAPI backend.
- Every request is tenant-scoped; never trust a tenant_id from the client for authorization.
