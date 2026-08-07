/**
 * @platformtrust/database
 *
 * ============================================================================
 * PLACEHOLDER CONFIGURATION CONTRACTS ONLY — NO ORM, NO CLIENT, NO CONNECTION
 * ============================================================================
 *
 * This package defines the *boundary* for shared database access in
 * PlatformTrust. At this stage it exposes **configuration interfaces only**.
 *
 * It does NOT:
 *  - install, import, or configure any ORM or query builder,
 *  - open connections or pools,
 *  - define schemas, migrations, or repositories,
 *  - contain credentials or connection strings.
 *
 * The concrete ORM/driver selection and connection strategy are **deferred to a
 * future ADR**. Per the platform rules, tenant isolation will be enforced via
 * PostgreSQL Row-Level Security and server-side tenant context; those mechanisms
 * are intentionally NOT implemented here.
 */

/** Supported database engine families (informational placeholder). */
export type DatabaseEngine = 'postgres';

/**
 * SSL/TLS mode for a database connection. Exact semantics depend on the driver
 * chosen in a future ADR; this is a placeholder enumeration.
 */
export type DatabaseSslMode = 'disable' | 'require' | 'verify-full';

/**
 * Placeholder configuration contract for a shared database connection.
 *
 * NOTE: This describes the *shape* of configuration only. No value of this type
 * establishes a connection. Secrets (passwords, connection strings) must be
 * supplied at runtime from secure configuration (e.g. Azure Key Vault) and must
 * never be committed. The `password` field intentionally exists only to document
 * the boundary; a real implementation should prefer a secret reference.
 */
export interface DatabaseConfig {
  /** Database engine family. Currently only Postgres is anticipated. */
  readonly engine: DatabaseEngine;
  /** Hostname of the database server. */
  readonly host: string;
  /** TCP port of the database server. */
  readonly port: number;
  /** Logical database/schema name to connect to. */
  readonly database: string;
  /** Username used to authenticate. */
  readonly user: string;
  /**
   * Credential value. Prefer supplying a secret *reference* resolved at runtime
   * rather than a literal. Never hard-code or commit this value.
   */
  readonly password?: string;
  /** SSL/TLS mode for the connection. */
  readonly sslMode?: DatabaseSslMode;
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
