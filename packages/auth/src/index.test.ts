import { describe, expect, it, expectTypeOf } from 'vitest';

import type {
  AuthenticatedPrincipal,
  AuthorizationDecision,
  AuthorizationEffect,
  PrincipalType,
  TenantContext,
} from './index.js';

// These are compile-time / shape assertions. This package ships no runtime
// behavior, so the tests exist to lock the placeholder contract shapes in place.
describe('@platformtrust/auth placeholder contracts', () => {
  it('allows constructing an AuthenticatedPrincipal shape', () => {
    const principal: AuthenticatedPrincipal = {
      id: '00000000-0000-0000-0000-000000000000',
      type: 'user',
      tenantId: '11111111-1111-1111-1111-111111111111',
      displayName: 'Example User',
      roles: ['viewer'],
    };
    expect(principal.type).toBe('user');
    expectTypeOf(principal.type).toEqualTypeOf<PrincipalType>();
  });

  it('allows constructing a TenantContext shape', () => {
    const ctx: TenantContext = { tenantId: '22222222-2222-2222-2222-222222222222' };
    expect(ctx.tenantId).toContain('2222');
  });

  it('allows constructing an AuthorizationDecision shape', () => {
    const decision: AuthorizationDecision = {
      effect: 'deny',
      reason: 'placeholder: no authorization is implemented',
      action: 'finding:read',
    };
    expect(decision.effect).toBe('deny');
    expectTypeOf(decision.effect).toEqualTypeOf<AuthorizationEffect>();
  });
});
