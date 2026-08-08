/**
 * Cross-cutting constants shared across PlatformTrust services and apps.
 *
 * These are generic, non-domain identifiers (service names, versions). They must
 * NOT contain business rules, scoring logic, or tenant-specific values.
 */

/**
 * Canonical, stable identifiers for the deployable units in the monorepo.
 * Used for logging, tracing, and inter-service metadata — not for routing or
 * authorization decisions.
 */
export const SERVICE_NAMES = Object.freeze({
  API: 'platformtrust-api',
  WEB: 'platformtrust-web',
  WORKER: 'platformtrust-worker',
  AI_SERVICE: 'platformtrust-ai-service',
} as const);

/** Union of the known service name identifiers. */
export type ServiceName = (typeof SERVICE_NAMES)[keyof typeof SERVICE_NAMES];

/**
 * Version of the shared package. Kept in sync with `package.json`. Consumers may
 * surface this in diagnostics/health endpoints.
 */
export const SHARED_PACKAGE_VERSION = '0.1.0' as const;

/**
 * The schema/contract version for shared primitives. Bump this when the shape of
 * exported shared types changes in a backwards-incompatible way.
 */
export const SHARED_CONTRACT_VERSION = 1 as const;
