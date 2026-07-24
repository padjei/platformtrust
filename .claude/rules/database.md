# Database Rules

PostgreSQL with Row-Level Security is the backbone of tenant isolation.

## Tenancy
- **Do** put a `tenant_id UUID NOT NULL` column on **every** tenant-owned table.
- **Do** enable **RLS** on every tenant-owned table and add a policy that filters
  by the current tenant (e.g. `current_setting('app.tenant_id')`).
- **Do** set the tenant context on the DB session/transaction from the
  authenticated request, server-side.
- **Don't** rely on application-layer `WHERE tenant_id = ...` alone — RLS is the
  backstop and must always be present.
- **Don't** ever derive `tenant_id` from client-supplied input.

## Keys and types
- **Do** use `UUID` primary keys, generated server-side; default to v4.
- **Do** store timestamps as `timestamptz` in **UTC**.
- **Don't** use serial/bigserial exposed IDs or naive `timestamp` columns.

## Queries
- **Do** use parameterized queries / SQLAlchemy bound parameters only.
- **Don't** interpolate values into SQL strings.
- **Do** add indexes for `tenant_id` and common filter/foreign-key columns.

## Migrations (Alembic)
- **Do** create an Alembic migration for **every** schema change.
- **Do** include `tenant_id`, RLS enablement, and policies in the migration that
  creates a tenant-owned table.
- **Do** write reversible `downgrade()` steps and test the migration up/down on a
  disposable DB.
- **Don't** ever edit a migration that has already been committed/merged — add a
  new migration instead.
- **Don't** make schema changes directly against a database outside of a migration.
- **Don't** put destructive data changes in the same migration as structural ones
  without an explicit, reviewed reason.
