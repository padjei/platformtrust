# @platformtrust/auth

Shared identity, tenant-context, and authorization **type contracts** for
PlatformTrust.

## IMPORTANT: contracts only — nothing is implemented

> This package contains **interfaces and types only**. It implements **no
> authentication and no authorization**. Importing these types does not
> authenticate a caller and does not authorize any action.

The types here describe the _shape_ of concepts the platform will use once a real
auth layer exists. Actual authentication and **server-side** authorization —
deny by default, least privilege, tenant isolation enforced server-side — must be
implemented in the API/service layers. The concrete auth provider selection is
**deferred to a future ADR**.

## Exported contracts

- `AuthenticatedPrincipal` — the shape of an authenticated caller (id, type,
  optional tenant, display name, roles). Its presence is not proof of
  authentication.
- `PrincipalType` — `'user' | 'service' | 'system'`.
- `TenantContext` — the tenant an operation is scoped to. Must be derived
  server-side from the authenticated session, never from client input.
- `AuthorizationDecision` / `AuthorizationEffect` — a _description_ of an
  allow/deny outcome. No evaluation logic is provided; the real decision must be
  produced and enforced server-side and must fail closed.

## Boundary / what does NOT belong here

- No token/session/credential handling.
- No policy evaluation or access-control enforcement.
- No provider SDKs or network calls.
- No tenant-specific or domain-specific permission catalogues.

## Testing

Type-shape tests live in `src/index.test.ts` and run with Vitest. They exist
purely to lock the placeholder contract shapes; there is no runtime behavior to
exercise.
