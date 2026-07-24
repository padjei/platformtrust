# Tenant Isolation

> **Status:** Authoritative. Referenced by `CLAUDE.md`. This is the canonical
> description of how tenant isolation is guaranteed in AI PlatformTrust.
> Cross-tenant access is the platform's top risk (see
> [`THREAT_MODEL.md`](./THREAT_MODEL.md#3-top-risk-cross-tenant-access)).

AI PlatformTrust is multi-tenant: many organizations' AI-readiness data,
evidence, and roadmaps live in one system. Isolation between tenants must be
guaranteed by construction, not by convention. Isolation is enforced at **two
independent layers** — the API and PostgreSQL Row-Level Security — so that a
mistake in one layer does not cause a breach.

Related documents:

- [`AUTHORIZATION_MODEL.md`](./AUTHORIZATION_MODEL.md) — roles and authZ.
- [`THREAT_MODEL.md`](./THREAT_MODEL.md) — cross-tenant attack paths.
- [`DATA_CLASSIFICATION.md`](./DATA_CLASSIFICATION.md) — sensitivity of tenant data.

---

## 1. Core rule

**Never trust a client-supplied tenant id.** The tenant for a request is
always derived from the authenticated principal's membership on the server.
No `tenant_id` from a request body, query string, header, path, or LLM output
is ever used to scope data.

---

## 2. `tenant_id` on every record

- Every tenant-owned table carries a non-nullable `tenant_id` column.
- `tenant_id` is set from the server-derived tenant context on insert — never
  from client input.
- Foreign-key relationships stay within a single tenant; cross-tenant
  references are invalid by design.
- Shared/global tables (e.g., the control library definitions) have no
  `tenant_id` and are read-only reference data, not tenant content.

---

## 3. PostgreSQL Row-Level Security (RLS)

RLS is the authoritative backstop. Even if application code forgets a filter,
the database will not return another tenant's rows.

- **RLS is enabled and forced** on every tenant-owned table (forced so that
  even the table owner is subject to policy).
- Policies filter rows by a **session variable** set per request/connection,
  e.g. `current_setting('app.tenant_id')`:

  ```sql
  ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE assessments FORCE ROW LEVEL SECURITY;

  CREATE POLICY tenant_isolation ON assessments
    USING (tenant_id = current_setting('app.tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);
  ```

- `USING` filters reads (and the row-visibility side of updates/deletes);
  `WITH CHECK` prevents writing rows that belong to another tenant.
- The application connects as a **non-superuser** role (superusers/`BYPASSRLS`
  roles bypass policies).
- The session variable is set from the authenticated tenant context — never
  from client input — at the start of each request, and reset/scoped so it
  cannot leak across pooled connections.

---

## 4. API middleware / dependency

At the API layer the tenant context is established once and reused:

1. Authenticate the caller (see
   [`AUTHORIZATION_MODEL.md`](./AUTHORIZATION_MODEL.md)).
2. Derive the tenant from the principal's membership — **not** from any client
   field.
3. Set the PostgreSQL RLS session variable (`app.tenant_id`) for the
   request's DB connection.
4. Authorize the action (role check) within that tenant scope.
5. Perform tenant-scoped queries; RLS enforces isolation regardless.

This mirrors the FastAPI dependency pattern in
[`AUTHORIZATION_MODEL.md`](./AUTHORIZATION_MODEL.md#6-api-dependency-pattern-fastapi):
`get_tenant_context` is the single source of tenant identity and the single
place the RLS variable is set.

Background jobs and async workers do not have an HTTP request, so they must
**explicitly carry tenant context** and set the RLS session variable before
touching tenant data.

---

## 5. Defense in depth

Isolation does not rely on any single mechanism:

| Layer | Control |
|-------|---------|
| API authN | Principal and tenant membership established from a verified token |
| API authZ | Role checks scoped to the derived tenant |
| API queries | Every tenant query filtered by the server-derived tenant |
| **PostgreSQL RLS** | Database-enforced row filtering — the backstop if app code errs |
| Storage | Evidence in tenant-partitioned Blob paths with scoped, short-lived access |
| Secrets | Connector/tenant secrets in Key Vault, not mixed in shared stores |
| Audit | Every privileged access logged with actor + tenant |

A cross-tenant leak would require *simultaneous* failure of the app layer
**and** RLS — the two are independent.

---

## 6. Required isolation tests

Tenant isolation tests are mandatory and are a **merge gate**. At minimum:

1. **Cross-tenant read denied** — a user in Tenant A cannot read Tenant B's
   assessments, results, evidence, or reports (returns not-found, not another
   tenant's data).
2. **Forged `tenant_id` ignored** — supplying another tenant's id in body,
   query, header, or path has no effect; the server-derived tenant governs.
3. **RLS backstop** — with the app-level filter deliberately removed in a
   test, RLS still prevents cross-tenant rows from being returned.
4. **Cross-tenant write blocked** — attempts to create/update a record under
   another tenant fail (RLS `WITH CHECK`).
5. **IDOR on resource ids** — requesting another tenant's resource by id
   returns not-found.
6. **Evidence isolation** — evidence URLs/tokens for Tenant A cannot access
   Tenant B's blobs.
7. **Background job scoping** — a job runs under exactly one tenant context
   and cannot touch other tenants' data.
8. **Missing tenant context fails closed** — a request/job without an
   established tenant context is denied, not defaulted.

New tenant-owned tables and new connectors require corresponding isolation
tests before merge (see [`SECURE_SDLC.md`](./SECURE_SDLC.md)).
