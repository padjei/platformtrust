# migrations

Alembic database migrations.

Rules:

- Every schema change requires a new migration. Generate with
  `alembic revision --autogenerate -m "..."` and review the output.
- Never edit a migration that has already been committed/applied. Add a new migration instead.
- Every tenant-owned table must include a `tenant_id UUID NOT NULL` column.
- Enable and enforce Row-Level Security (RLS) on tenant-owned tables so cross-tenant reads/writes
  are impossible even with a bug in application code.
- Timestamps are `timestamptz` stored in UTC; primary keys are UUIDs.
