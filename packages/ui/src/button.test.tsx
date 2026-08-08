import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './index.js';

describe('Button', () => {
  it('renders a semantic <button> with an accessible name', () => {
    render(<Button>Save changes</Button>);
    const button = screen.getByRole('button', { name: 'Save changes' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAccessibleName('Save changes');
  });

  it('defaults the type attribute to "button"', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button', { name: 'Click' })).toHaveAttribute('type', 'button');
  });

  it('is keyboard-focusable by default', () => {
    render(<Button>Focus me</Button>);
    const button = screen.getByRole('button', { name: 'Focus me' });
    button.focus();
    expect(button).toHaveFocus();
  });

  it('forwards a ref to the underlying DOM node', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>With ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('is not focusable via keyboard traversal when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
  });
});
