# @platformtrust/ui

Shared, accessible UI primitives for PlatformTrust apps (React 19), consumed by
`apps/web`.

## Scope and boundary

This package provides **one minimal, accessible primitive today** — it is
deliberately **not** a design system. The goal is to give apps a single,
correctly-typed, accessible building block rather than a component library.

- Presentational only: no business logic and no data fetching. Components receive
  everything via props.
- Accessibility first: primitives render semantic HTML so they work with the
  keyboard and assistive technology by default.
- React and React DOM are **peer dependencies** (`^19`); apps provide the runtime
  copies.

## Exports

- `Button` — a semantic `<button>` primitive using `forwardRef`, with fully typed
  props extending the native button attributes. It is keyboard-focusable and
  operable by default, defaults `type` to `"button"` (no accidental form
  submission), and forwards refs to the underlying DOM node.
- `ButtonProps` — the prop type for `Button`.

```tsx
import { Button } from '@platformtrust/ui';

export function Example() {
  return <Button onClick={() => console.log('clicked')}>Save changes</Button>;
}
```

## What does NOT belong here

- No design-system tokens, theming engine, or large component catalogue.
- No business logic, data fetching, or global state.

## Testing

Component tests run with Vitest in a `jsdom` environment using
`@testing-library/react` and `@testing-library/jest-dom`
(`src/test/setup.ts`). They assert the primitive renders a real `<button>` with
an accessible name and is keyboard-focusable.

```bash
pnpm --filter @platformtrust/ui test
```
