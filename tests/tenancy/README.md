# tenancy tests

Tenant isolation tests. Multi-tenancy is enforced at the database layer with Row-Level Security.

- Every tenant-owned record carries a `tenant_id`.
- **Cross-tenant access must fail:** a request in tenant A must never read or write tenant B's data,
  even if application code has a bug (RLS is the backstop).
- Verify RLS policies are present and active on all tenant-owned tables.
