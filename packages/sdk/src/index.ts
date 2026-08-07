/**
 * @platformtrust/sdk
 *
 * ============================================================================
 * CLIENT CONFIGURATION CONTRACTS ONLY — NO API OPERATIONS ARE IMPLEMENTED
 * ============================================================================
 *
 * This package is the boundary for the typed PlatformTrust API client. At this
 * stage it exposes **initial client configuration types only**. It contains no
 * generated API operations, no resource methods, no HTTP calls, and no
 * authentication logic.
 *
 * The SDK will follow documented API contracts and must never bypass API
 * authorization. Generated operations and resource clients will be added later.
 */

/** Default request timeout, in milliseconds, suggested for clients. */
export const DEFAULT_TIMEOUT_MS = 30_000 as const;

/**
 * Initial configuration contract for a PlatformTrust API client.
 *
 * NOTE: This describes the *shape* of client configuration only. Constructing a
 * value of this type does not create a client or perform any request. Auth
 * tokens supplied here must be treated as sensitive and never logged; browser
 * consumers must never embed privileged tokens or cloud credentials.
 */
export interface PlatformTrustClientConfig {
  /** Absolute base URL of the PlatformTrust API (e.g. `https://api.example`). */
  readonly baseUrl: string;
  /**
   * Request timeout in milliseconds. Defaults to {@link DEFAULT_TIMEOUT_MS} in a
   * future client implementation when omitted.
   */
  readonly timeoutMs?: number;
  /**
   * Optional bearer token for authenticated requests. Sensitive — never log or
   * embed in a browser bundle. A future client will send this only over TLS.
   */
  readonly authToken?: string;
  /** Optional extra headers to attach to every request (non-sensitive only). */
  readonly defaultHeaders?: Readonly<Record<string, string>>;
}
