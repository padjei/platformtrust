# @platformtrust/database

Boundary package for shared database access in PlatformTrust.

## IMPORTANT: configuration contracts only — no ORM, no client

> This package currently exposes **configuration interfaces only**. It does
> **not** install or configure an ORM, open connections, define schemas or
> migrations, or hold any credentials.

The concrete ORM/driver selection and connection strategy are **deferred to a
future ADR** (see `CLAUDE.md`: "Database/ORM selection is deferred to a future
ADR"). This package exists now to reserve the boundary and to give other
packages a stable place to reference database _configuration shapes_.

## Exported contracts

- `DatabaseConfig` — the shape of a shared database connection configuration
  (engine, host, port, database, user, optional credential reference, SSL mode,
  pool hints). No value of this type opens a connection.
- `DatabasePoolConfig` — placeholder connection-pool sizing hints.
- `DatabaseEngine` — anticipated engine family (`'postgres'`).
- `DatabaseSslMode` — `'disable' | 'require' | 'verify-full'`.

## Planned scope (once the ADR lands)

Per the platform rules, the eventual implementation will provide tenant-safe
persistence utilities. Tenant isolation MUST be enforced with PostgreSQL
Row-Level Security and server-side tenant context; every tenant-owned table will
carry `tenant_id UUID NOT NULL`, use UUID primary keys, and store timestamps as
`timestamptz` in UTC. None of that is implemented here yet.

## Boundary / what does NOT belong here

- No ORM/driver dependency, connection pool, or live client.
- No schema definitions, migrations, or repositories.
- No credentials, connection strings, or secrets — those come from secure
  runtime configuration (e.g. Azure Key Vault) at deploy time.

## Testing

No runtime behavior exists yet, so this package has no tests; `test` and
`test:coverage` are intentional no-ops.
