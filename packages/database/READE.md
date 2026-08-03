# PlatformTrust Database Package

This package provides shared database access, schemas, migrations,
transactions, and tenant-safe persistence utilities.

## Responsibilities

- Database client configuration.
- Schema definitions.
- Migration management.
- Transaction helpers.
- Tenant-scoped query helpers.
- Repository abstractions where justified.
- Database test utilities.
- Seed data for approved development scenarios.

## Rules

- All tenant-owned queries must apply tenant scope.
- Raw queries require explicit review.
- Production schema changes require migrations.
- Destructive migrations require an approved migration plan.
- Database credentials must come from secure runtime configuration.
- Business services must not construct unauthorized cross-tenant queries.
- Database errors must be translated before reaching public APIs.

## Planned Contents

```text
src/
├── client/
├── schema/
├── migrations/
├── repositories/
├── tenancy/
├── transactions/
└── testing/
