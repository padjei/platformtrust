# api tests

Pytest suite for the API.

- Unit tests for domain and scoring logic (scoring must be deterministic).
- Integration tests using Testcontainers + PostgreSQL.
- Tenancy isolation tests: verify RLS blocks cross-tenant access and that every tenant-owned
  query is scoped by `tenant_id`. Cross-tenant access must fail.

Run with `pytest`.
