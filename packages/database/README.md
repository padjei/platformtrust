# @platformtrust/database

Boundary package for shared database access in PlatformTrust.

## IMPORTANT: package boundary only — no ORM, no client, no technology chosen

> This package currently exposes **generic, provider-neutral configuration
> interfaces only**. It does **not** install or configure an ORM, open
> connections, define schemas or migrations, hold any credentials, or select a
> database technology.

The database technology, ORM/driver selection, connection strategy, and
tenant-isolation mechanism are **deferred to a future ADR** (see
[ADR-0002](../../docs/adr/ADR-0002-initial-application-technology-stack.md):
database and cloud decisions are out of scope for the bootstrap). This package
exists now to reserve the boundary and give other packages a stable place to
reference database _configuration shapes_.

## Exported contracts

- `DatabaseConfig` — the shape of a future database connection configuration (an
  opaque, runtime-resolved connection reference plus optional pool hints). No
  value of this type opens a connection.
- `DatabasePoolConfig` — placeholder connection-pool sizing hints.

## Planned scope (once the ADR lands)

The eventual implementation will provide tenant-safe persistence utilities. The
specific database technology, isolation mechanism, identifier strategy, and
timestamp handling will be decided in the future database ADR — none of that is
chosen or implemented here.

## Boundary / what does NOT belong here

- No ORM/driver dependency, connection pool, or live client.
- No schema definitions, migrations, or repositories.
- No credentials, connection strings, or secrets — those come from secure
  runtime configuration at deploy time.
- No database technology or cloud-provider selection.

## Testing

No runtime behavior exists yet, so this package has no tests; `test` and
`test:coverage` are intentional no-ops.
