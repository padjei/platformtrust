# Accessibility Standard

> PlatformTrust engineering standard (PT-002 §14). This standard translates the
> constitutional accessibility requirements into reviewable engineering
> expectations. When it appears to conflict with a higher source, follow the
> precedence order in [the standards README](./README.md#precedence) and surface
> the conflict.

## 1. Purpose

This standard adopts **WCAG 2.2 Level AA** as the accessibility target for
PlatformTrust and defines concrete engineering expectations to meet it. It
operationalizes [Constitution Article XIV (Accessibility Is a Baseline
Requirement)](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xiv--accessibility-is-a-baseline-requirement)
and [Article XV (Enterprise UX Over Visual Novelty)](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xv--enterprise-ux-over-visual-novelty),
and it operationalizes [Handbook §39 (Accessibility Practice)](../handbook/ENGINEERING_HANDBOOK.md#39-accessibility-practice).

Under the Constitution, **accessibility defects are product defects**. This
standard does not redesign the product UI; it defines the accessibility bar that
existing and new UI MUST meet.

## 2. Scope

This standard applies to all user-facing surfaces:

- `apps/web` (Next.js) pages, flows, and components.
- Shared UI primitives in [`packages/ui`](../../packages/ui/README.md).
- Any user-facing rendering of AI-generated content.

It covers semantic HTML, keyboard navigation, focus management, screen-reader
compatibility, contrast, forms and validation, dialogs/modals, tables and charts,
status/error/loading states, reduced motion, and testing expectations.

This standard does **not** redesign the UI and does **not** select an
accessibility-testing vendor or tool. Automated and manual testing expectations
are described generically; see the [Testing Standard](./TESTING_STANDARD.md) for
how they fit the overall testing strategy.

## 3. Mandatory requirements

The target conformance level is **WCAG 2.2 AA**. All user-facing changes MUST meet
the following, which are necessary (not exhaustive) conditions for that target.

### 3.1 Semantic HTML

- UI MUST use semantic HTML elements for their intended purpose (headings,
  lists, `button`, `a`, `nav`, `main`, `table`, form controls). Non-semantic
  elements (`div`/`span`) MUST NOT be used to fake interactive controls.
- Reusable primitives SHOULD be built from, or extend,
  [`packages/ui`](../../packages/ui/README.md), which renders semantic HTML so
  primitives are keyboard- and assistive-technology-operable by default. New
  interactive primitives SHOULD follow that same "semantic HTML first" approach
  rather than reimplementing native behavior.
- Page structure MUST use a correct, hierarchical heading order and landmark
  regions.

### 3.2 Keyboard navigation

- All interactive functionality MUST be operable by keyboard alone, with no
  keyboard traps.
- Focus order MUST be logical and follow the visual/reading order.
- Custom interactive components MUST implement the expected keyboard interaction
  pattern for their role (e.g. `Enter`/`Space` activation, arrow-key navigation
  within composite widgets, `Esc` to dismiss).

### 3.3 Focus management

- A visible focus indicator MUST be present for all focusable elements and MUST
  meet AA contrast against adjacent colors.
- When views, dialogs, or route transitions change context, focus MUST be moved
  to a sensible target; focus MUST NOT be silently lost to the document body.
- Focus MUST be restored to the triggering control when a dialog or transient
  surface closes.

### 3.4 Screen-reader compatibility

- Every interactive element MUST have an accessible name (visible label,
  associated `<label>`, or an appropriate `aria-label`/`aria-labelledby`).
- ARIA roles/states MUST be used only when native semantics are insufficient, and
  MUST accurately reflect the component's state. Incorrect ARIA MUST NOT be added.
- Icon-only controls MUST expose a text alternative; decorative imagery MUST be
  hidden from assistive technology.
- Dynamic updates that users must perceive MUST be announced (e.g. via live
  regions) without stealing focus.

### 3.5 Contrast and visual presentation

- Text and meaningful non-text UI MUST meet WCAG 2.2 AA contrast minimums.
- Color MUST NOT be the sole means of conveying information, state, or meaning
  (e.g. pass/fail, error, required).
- The UI MUST remain usable and MUST NOT lose content or functionality at 200%
  zoom / reflow, consistent with enterprise-density expectations in
  [Article XV](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xv--enterprise-ux-over-visual-novelty).

### 3.6 Forms and validation

- Every form control MUST have a programmatically associated label.
- Validation errors MUST be presented in text, associated with the offending
  control, and conveyed to assistive technology; errors MUST NOT rely on color or
  placement alone.
- Required fields, formats, and constraints MUST be communicated before and during
  input, with clear, understandable error messaging.
- On submit failure, focus SHOULD move to the first error or an error summary.

### 3.7 Dialogs and modals

- Modal dialogs MUST use the appropriate dialog role/semantics, MUST trap focus
  while open, MUST be dismissible by keyboard (`Esc`), and MUST return focus to
  the trigger on close.
- Content behind a modal MUST be inert to keyboard and assistive technology while
  the modal is open.

### 3.8 Tables and charts

- Data tables MUST use real table semantics with associated header cells; layout
  MUST NOT be built from non-semantic markup.
- Charts and visualizations MUST provide a text alternative conveying the same
  information (e.g. accessible summary and/or an associated data table), and MUST
  NOT rely on color alone to distinguish series or values.

### 3.9 Status, error, and loading states

- Every data view MUST handle and expose loading, empty, and error states
  explicitly, and these states MUST be perceivable by assistive technology.
- Status changes and asynchronous outcomes MUST be announced without requiring a
  visual scan.

### 3.10 Reduced motion

- The UI MUST respect the user's reduced-motion preference
  (`prefers-reduced-motion`) and MUST provide non-animated equivalents.
- Motion MUST NOT be required to convey meaning, and no content MUST flash in a
  way that risks seizures.

### 3.11 AI-generated content

- User-facing AI-generated content MUST meet the same accessibility requirements
  as the rest of the UI (semantics, contrast, screen-reader compatibility) and be
  clearly labeled, consistent with [Handbook §39](../handbook/ENGINEERING_HANDBOOK.md#39-accessibility-practice).

### 3.12 Testing

- Accessibility MUST be validated with both automated and manual checks; automated
  testing does **not** replace manual review
  ([Handbook §39](../handbook/ENGINEERING_HANDBOOK.md#39-accessibility-practice)).
- **Automated** (tool-neutral): user-facing changes SHOULD run automated
  accessibility checks in the component/integration/e2e test layers to catch
  regressions such as missing names, invalid ARIA, and contrast failures. The
  specific tooling is not mandated here; see the [Testing Standard](./TESTING_STANDARD.md).
- **Manual** (tool-neutral): user-facing changes MUST be reviewed for keyboard-only
  operation, focus order and visibility, screen-reader output, and the state
  behaviors in §3.6–§3.9 before merge.
- This standard does not set coverage thresholds; it defines the checks that MUST
  be performed.

## 4. Prohibited practices

- Interactive controls MUST NOT be built from non-semantic elements that lack
  keyboard operability and an accessible name.
- Functionality MUST NOT be keyboard-inaccessible or contain keyboard traps.
- Information, state, or errors MUST NOT be conveyed by color alone.
- Focus MUST NOT be removed, hidden, or lost such that keyboard users cannot track
  it.
- Incorrect or decorative ARIA that misrepresents component state MUST NOT be
  added.
- Accessibility defects MUST NOT be deprioritized as cosmetic; they are product
  defects ([Article XIV](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xiv--accessibility-is-a-baseline-requirement)).

## 5. Examples

Prefer semantic, labeled controls (illustrative):

```tsx
import { Button } from '@platformtrust/ui';

// Accessible: real <button>, keyboard-operable, with an accessible name.
<Button onClick={onSave}>Save changes</Button>;

// Icon-only control still needs an accessible name.
<Button aria-label="Delete assessment" onClick={onDelete}>
  <TrashIcon aria-hidden="true" />
</Button>;
```

Do not fake interactive controls:

```tsx
// Prohibited: not focusable, no role, no keyboard activation, no accessible name.
<div className="btn" onClick={onSave}>
  Save changes
</div>;
```

## 6. Enforcement mechanisms

- **Automated checks in CI:** Accessibility assertions run within the existing
  Vitest/Playwright test layers (tooling per the
  [Testing Standard](./TESTING_STANDARD.md)); regressions fail the build.
- **Static analysis and review:** ESLint/Prettier run in CI; reviewers check
  semantics, labels, ARIA correctness, and focus handling.
- **Manual accessibility review:** User-facing changes MUST pass the manual review
  in §3.12 before merge, per [Handbook §39](../handbook/ENGINEERING_HANDBOOK.md#39-accessibility-practice).
- **Definition of Done:** Accessibility validation is part of the handbook
  Definition of Done for user-facing work
  ([Handbook §47](../handbook/ENGINEERING_HANDBOOK.md#47-definition-of-done)).
- **Validation commands:** Changes MUST pass the repository validation flow via
  pnpm (`pnpm lint`, `pnpm typecheck`, `pnpm test`). Validation is run via pnpm,
  not make.

An accessibility requirement without corresponding enforcement is considered
incomplete.

## 7. Exception process

Any deviation from this standard requires an explicit, documented exception under
[Constitution §6 (Exception Process)](../constitution/PLATFORMTRUST_CONSTITUTION.md#6-exception-process).
Silent exceptions are prohibited. An exception request MUST include the affected
requirement, business and technical justification, user impact, compensating
controls, the exception owner, the approval authority, an expiration date, and a
remediation plan.

## 8. Related Constitution articles

- [Article XIV — Accessibility Is a Baseline Requirement](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xiv--accessibility-is-a-baseline-requirement)
- [Article XV — Enterprise UX Over Visual Novelty](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xv--enterprise-ux-over-visual-novelty)
- [Article XVI — Everything Must Be Testable](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvi--everything-must-be-testable)

## 9. Related Handbook sections

- [§39 — Accessibility Practice](../handbook/ENGINEERING_HANDBOOK.md#39-accessibility-practice)
- [§28 — Testing Strategy (Accessibility Tests)](../handbook/ENGINEERING_HANDBOOK.md#28-testing-strategy)
- [§47 — Definition of Done](../handbook/ENGINEERING_HANDBOOK.md#47-definition-of-done)

## Related standards

- [Testing Standard](./TESTING_STANDARD.md)
- Shared UI primitives — [`packages/ui`](../../packages/ui/README.md)
