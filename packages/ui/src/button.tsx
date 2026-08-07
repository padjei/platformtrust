import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

/**
 * Props for {@link Button}. Extends the native button attributes so every
 * standard, accessible behavior (disabled, aria-*, onClick, keyboard handling)
 * is available and forwarded to a real `<button>` element.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button contents (label, icon, etc.). */
  readonly children?: ReactNode;
}

/**
 * Minimal, accessible button primitive.
 *
 * Renders a semantic `<button>` element so it is keyboard-focusable and
 * operable (Enter/Space) by default with no extra wiring. The `type` defaults to
 * `"button"` to avoid accidental form submission. Refs are forwarded to the
 * underlying DOM node.
 *
 * This is intentionally NOT a design system — it adds no styling opinions and
 * exists so `apps/web` has one shared, correctly-typed accessible primitive.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { type = 'button', children, ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} {...rest}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';
