/**
 * @platformtrust/auth
 *
 * ============================================================================
 * PLACEHOLDER CONTRACTS ONLY — NO AUTHENTICATION OR AUTHORIZATION IS IMPLEMENTED
 * ============================================================================
 *
 * This package defines TYPES and INTERFACES that describe the *shape* of the
 * identity, tenant-context, and authorization concepts PlatformTrust will use.
 * It deliberately contains **no runtime behavior**: no token validation, no
 * session handling, no policy evaluation, no access-control enforcement.
 *
 * Importing these types does NOT authenticate a caller and does NOT authorize
 * any action. Real authentication and server-side authorization must be
 * implemented in the API/service layers per the governance rules (deny by
 * default, least privilege, tenant isolation enforced server-side). The concrete
 * auth provider selection is deferred to a future ADR.
 */

/**
 * Describes an authenticated caller as understood by downstream code.
 *
 * NOTE: This is a placeholder contract. The presence of a value typed as
 * `AuthenticatedPrincipal` does not, by itself, prove authentication occurred —
 * that guarantee comes only from the (not-yet-implemented) auth layer that
 * produces it.
 */
export interface AuthenticatedPrincipal {
  /** Stable, server-generated identifier for the principal (e.g. a UUID). */
  readonly id: string;
  /** The kind of principal this represents. */
  readonly type: PrincipalType;
  /** Tenant the principal is acting within, if any. */
  readonly tenantId?: string;
  /** Opaque, human-readable label for display/audit (never a secret). */
  readonly displayName?: string;
  /**
   * Coarse role identifiers associated with the principal. These are contract
   * placeholders only and MUST be re-verified server-side; never trust roles
   * supplied by a client.
   */
  readonly roles?: readonly string[];
}

/** The category of an {@link AuthenticatedPrincipal}. */
export type PrincipalType = 'user' | 'service' | 'system';

/**
 * Describes the tenant an operation is scoped to.
 *
 * NOTE: Placeholder contract. Tenant context must always be derived from the
 * authenticated session server-side and never from client-supplied input.
 */
export interface TenantContext {
  /** Server-resolved tenant identifier (e.g. a UUID). */
  readonly tenantId: string;
  /** Optional non-sensitive display name for the tenant. */
  readonly tenantName?: string;
}

/** The outcome of an authorization check. */
export type AuthorizationEffect = 'allow' | 'deny';

/**
 * Describes the result of an authorization decision.
 *
 * NOTE: Placeholder contract. No evaluation logic is provided here. A value of
 * this type is a *description* of a decision, not the enforcement of one; the
 * decision itself must be produced and enforced by the server-side auth layer,
 * which fails closed (deny by default).
 */
export interface AuthorizationDecision {
  /** Whether the action is allowed or denied. */
  readonly effect: AuthorizationEffect;
  /** Optional, non-sensitive human-readable reason for auditing/debugging. */
  readonly reason?: string;
  /** Identifier of the action that was evaluated (e.g. `"finding:read"`). */
  readonly action?: string;
  /** Identifier of the resource the action targeted. */
  readonly resourceId?: string;
}
