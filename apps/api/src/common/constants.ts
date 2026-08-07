/**
 * Static service identity used in health responses and structured logs.
 *
 * These are intentionally kept local to the application so the app is
 * self-contained. If a shared `@platformtrust/shared` constants module is
 * adopted later, these can be re-exported from it without changing callers.
 */
export const SERVICE_NAME = 'platformtrust-api';
export const SERVICE_VERSION = '0.1.0';
