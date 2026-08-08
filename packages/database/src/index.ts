/**
 * @platformtrust/database
 *
 * ============================================================================
 * PLACEHOLDER PACKAGE BOUNDARY ONLY — NO ORM, NO CLIENT, NO CONNECTION
 * ============================================================================
 *
 * This package defines the *boundary* for shared database access in
 * PlatformTrust. At this stage it exposes **generic, provider-neutral
 * configuration interfaces only**.
 *
 * It does NOT:
 *  - install, import, or configure any ORM, driver, or query builder,
 *  - open connections or pools,
 *  - define schemas, migrations, or repositories,
 *  - contain credentials or connection strings,
 *  - select or assume a database technology, engine, or cloud provider.
 *
 * The database technology, ORM/driver selection, connection strategy, and
 * tenant-isolation mechanism are **deferred to a future ADR** and are
 * intentionally NOT decided or implemented here.
 */

/**
 * Provider-neutral placeholder configuration contract for a future shared
 * database connection.
 *
 * NOTE: This describes the *shape* of configuration only. No value of this type
 * establishes a connection. Credentials must be supplied at runtime from secure
 * configuration (never committed) and are intentionally modeled as an opaque,
 * resolved-at-runtime reference rather than a literal. Concrete fields will be
 * defined once a database technology is selected in a future ADR.
 */
export interface DatabaseConfig {
  /**
   * Opaque connection target (e.g. a DSN or endpoint) resolved at runtime from
   * secure configuration. The exact format depends on the technology selected
   * in a future ADR. Never hard-code or commit a real value.
   */
  readonly connectionRef?: string;
  /** Optional connection-pool sizing hints for a future implementation. */
  readonly pool?: DatabasePoolConfig;
}

/**
 * Placeholder connection-pool sizing hints. No pool is created by this package.
 */
export interface DatabasePoolConfig {
  /** Minimum number of connections a future pool should retain. */
  readonly min?: number;
  /** Maximum number of connections a future pool may open. */
  readonly max?: number;
  /** Idle timeout, in milliseconds, before a pooled connection is released. */
  readonly idleTimeoutMs?: number;
}
