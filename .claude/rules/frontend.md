# Frontend Rules

Next.js + React + TypeScript (strict) + Tailwind + shadcn/ui + TanStack Query +
React Hook Form + Zod.

## TypeScript and components
- **Do** keep `strict` mode on; type all props, hooks, and API responses.
- **Do** build UI from **shadcn/ui** primitives and Tailwind; keep components small
  and composable.
- **Don't** use `any`, non-null assertions to dodge types, or `@ts-ignore` to hide
  real errors.
- **Don't** hand-roll components that shadcn/ui already provides.

## Data fetching and forms
- **Do** use **TanStack Query** for server state (fetching, caching, invalidation);
  keep query keys consistent and scoped.
- **Do** use **React Hook Form + Zod** for all forms; define a Zod schema and infer
  the type from it.
- **Do** validate API responses against Zod schemas at the boundary before use.
- **Don't** store server data in ad-hoc `useState`/global state when Query fits.
- **Don't** submit unvalidated form data.

## Security in the browser
- **Don't** ever place cloud credentials, connector secrets, service keys, or
  privileged tokens in the browser, bundle, or `NEXT_PUBLIC_*` vars.
- **Do** call the backend for all privileged actions; the server enforces authz and
  tenant scope.
- **Do** treat the UI as untrusted — never rely on hidden/disabled controls for
  access control.
- **Don't** render unsanitized HTML (`dangerouslySetInnerHTML`) from user or
  connector data.

## UX consistency
- **Do** handle loading, empty, and error states explicitly for every data view.
- **Do** display timestamps converted from UTC at the presentation layer.
