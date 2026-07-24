# Multi-Tenancy — AI PlatformTrust

> **Related docs:** [System Architecture](./SYSTEM_ARCHITECTURE.md) · [Domain Model](./DOMAIN_MODEL.md) · [Connector Framework](./CONNECTOR_FRAMEWORK.md) · [MVP Scope](../product/MVP_SCOPE.md)

## 1. Principles

AI PlatformTrust is **multi-tenant from day one**. Tenant isolation is a correctness and security requirement, not a feature.

- **Every tenant-owned record carries a `tenant_id`** (see [Domain Model](./DOMAIN_MODEL.md)).
- **Defense in depth:** isolation is enforced at the **API layer** *and* in **PostgreSQL Row-Level Security (RLS)**.
- **Never trust a client-supplied tenant id.** The tenant is always derived from the authenticated server-side session.
- UUID PKs and UTC timestamps everywhere.

## 2. Tenant Id Column Strategy

- A single `tenant_id UUID NOT NULL` column on every tenant-owned table.
- Foreign keys reference within the same tenant; cross-tenant references are impossible by construction.
- Indexes lead with `tenant_id` (e.g., `(tenant_id, id)`, `(tenant_id, <lookup column>)`) so queries are both fast and naturally tenant-scoped.

## 3. PostgreSQL Row-Level Security

RLS is the backstop that guarantees isolation even if application code has a bug.

1. **Enable RLS** on every tenant-owned table:
   ```sql
   ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
   ALTER TABLE <table> FORCE ROW LEVEL SECURITY;
   ```
2. **Policy** ties each row to the session's current tenant:
   ```sql
   CREATE POLICY tenant_isolation ON <table>
     USING (tenant_id = current_setting('app.current_tenant')::uuid)
     WITH CHECK (tenant_id = current_setting('app.current_tenant')::uuid);
   ```
   - `USING` filters reads and the pre-image of writes.
   - `WITH CHECK` prevents inserting/updating rows into another tenant.
3. The application connects as a **non-superuser** role (superusers/`BYPASSRLS` bypass policies) so policies always apply.

## 4. Session-Scoped `current_tenant`

- On each request (or worker job), after resolving the tenant from the session, the DB session sets the tenant:
  ```sql
  SELECT set_config('app.current_tenant', $1, true);  -- true = transaction-local
  ```
- All subsequent queries in that transaction are transparently filtered by RLS.
- The setting is **transaction-local** so it never leaks across pooled connections.

## 5. API-Layer Enforcement

RLS is the backstop; the API is the first line of defense.

- Authentication establishes the user and their tenant server-side.
- Middleware resolves `current_tenant` and sets it on the DB session (§4).
- Handlers never accept a tenant id from the request body/query/header as authoritative. If one is present, it is ignored or rejected — **never trusted**.
- Every write sets `tenant_id` from the resolved session value.

## 6. Connectors & Background Work

- The **worker** re-establishes tenant context before processing any job; jobs carry the tenant id resolved server-side, and the worker sets `app.current_tenant` accordingly.
- Connector-pulled data is written under the owning tenant only. Connector credentials live in Key Vault, referenced per [ConnectorAccount](./DOMAIN_MODEL.md); see [Connector Framework](./CONNECTOR_FRAMEWORK.md).
- Normalized [Events](./EVENT_MODEL.md) always carry `tenant_id`.

## 7. Testing Tenancy Isolation

Isolation must be proven, not assumed. The target is **zero** cross-tenant access.

| Test | What it verifies |
|------|------------------|
| RLS read isolation | A session scoped to tenant A cannot read tenant B rows, even with a crafted query. |
| RLS write isolation | A session scoped to tenant A cannot insert/update rows with tenant B's id (`WITH CHECK`). |
| API rejects client tenant id | Supplying a foreign `tenant_id` in a request does not grant access. |
| Missing tenant context | A query with no `app.current_tenant` set returns no tenant-owned rows (fails closed). |
| Worker context | Background jobs process only their own tenant's data. |
| Connection pooling | Transaction-local setting does not leak between requests sharing a pooled connection. |

These tests run in CI (GitHub Actions) and must pass before deploy.

## 8. Anti-Patterns (do not do)

- Trusting `tenant_id` from client input.
- Running the app as a DB superuser or a role with `BYPASSRLS`.
- Setting `app.current_tenant` as session-scoped (not transaction-local) on a pooled connection.
- Adding a tenant-owned table without RLS + `tenant_id`.
- Any query path that can join across tenants.
