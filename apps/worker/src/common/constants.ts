/**
 * Static service identity used in the worker health state and structured logs.
 *
 * Kept local so the app is self-contained; may be re-exported from a shared
 * constants module later without changing callers.
 */
export const SERVICE_NAME = 'platformtrust-worker';
export const SERVICE_VERSION = '0.1.0';
