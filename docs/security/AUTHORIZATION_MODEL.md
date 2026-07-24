# Authorization Model

This document defines authentication vs. authorization, the role model,
the permissions matrix, and how authorization is enforced server-side and
scoped to a tenant on every decision.

Related documents:

- [`TENANT_ISOLATION.md`](./TENANT_ISOLATION.md) — tenant scoping backstop (RLS).
- [`THREAT_MODEL.md`](./THREAT_MODEL.md) — elevation-of-privilege threats.
- [`DATA_CLASSIFICATION.md`](./DATA_CLASSIFICATION.md) — sensitivity of data being protected.

---

## 1. Authentication vs. authorization

- **Authentication (authN)** — *who are you?* Verifies the identity of the
  caller and establishes an authenticated principal (user or service) and
  their tenant membership. Handled at the browser ↔ API boundary via a
  verified session token / JWT over TLS.
- **Authorization (authZ)** — *what may you do?* Decides whether the
  authenticated principal may perform a specific action on a specific
  resource, within a specific tenant.

**AuthN never implies authZ.** Every privileged action is authorized
explicitly, server-side, and within a tenant scope. LLM output never
participates in an authorization decision.

---

## 2. Roles

### Tenant roles

Scoped to a single tenant. A user's role applies only within the tenant(s)
they belong to.

| Role | Purpose |
|------|---------|
| **Owner** | Full control of the tenant, including billing, tenant settings, member management, and deletion. Typically the account creator. |
| **Admin** | Manages members (below Owner), connectors, and configuration; runs and manages assessments; cannot delete the tenant or change ownership. |
| **Assessor** | Performs assessments: answers controls, uploads evidence, records results, drafts remediation. Cannot manage members or connectors. |
| **Viewer** | Read-only access to assessments, results, and reports within the tenant. |

### Platform roles

Separate from tenant roles. Held by platform operators, not customers. These
never grant implicit access to tenant data; access to tenant content still
requires explicit, audited justification and is subject to isolation controls.

| Role | Purpose |
|------|---------|
| **Platform Admin** | Operates the platform (tenant provisioning, system config). Not a super-tenant; no blanket read of tenant evidence. |
| **Support / Operator** | Limited operational access for support; break-glass access is explicit, time-boxed, and audited. |

---

## 3. Permissions matrix

Legend: ✅ allowed · ❌ denied · 👁 read-only

| Action | Owner | Admin | Assessor | Viewer |
|--------|:-----:|:-----:|:--------:|:------:|
| View assessments, results, reports | ✅ | ✅ | ✅ | 👁 |
| Create / run assessment | ✅ | ✅ | ✅ | ❌ |
| Answer controls / record results | ✅ | ✅ | ✅ | ❌ |
| Upload / manage evidence | ✅ | ✅ | ✅ | ❌ |
| Draft remediation roadmap | ✅ | ✅ | ✅ | ❌ |
| **Approve production remediation** | ✅ | ✅ | ❌ | ❌ |
| Configure connectors | ✅ | ✅ | ❌ | ❌ |
| Manage tenant members / roles | ✅ | ✅¹ | ❌ | ❌ |
| Change tenant settings | ✅ | ✅ | ❌ | ❌ |
| Change ownership / billing | ✅ | ❌ | ❌ | ❌ |
| Delete tenant / tenant data | ✅ | ❌ | ❌ | ❌ |
| View audit log | ✅ | ✅ | 👁² | ❌ |

¹ Admin cannot elevate a member to Owner or remove the Owner.
² Assessor may see audit entries relevant to their own actions where exposed;
full audit access is Owner/Admin.

Platform roles are intentionally omitted from the tenant matrix — they operate
on platform resources, not as a tenant super-user.

Note: **approving production remediation** requires a human with Admin/Owner
authority — it is never automated and never driven by LLM output (see
[`THREAT_MODEL.md`](./THREAT_MODEL.md#6-llm-specific-threats)).

---

## 4. Server-side enforcement

Authorization is enforced **only** on the server. Client-side checks are for
UX (hiding buttons) and are never trusted.

Principles:

1. **Every privileged endpoint authorizes explicitly.** No endpoint relies on
   the UI having hidden an action.
2. **Deny by default.** Absence of an explicit grant means denied.
3. **Least privilege.** Roles grant the minimum needed.
4. **Tenant scope on every decision.** See Section 5.
5. **No client-settable authority.** Role and tenant are never accepted from
   request bodies; they come from the authenticated context.
6. **Audit every privileged action.** actor, tenant, action, target,
   timestamp — no sensitive payload (see
   [`DATA_CLASSIFICATION.md`](./DATA_CLASSIFICATION.md)).

---

## 5. Tenant scoping of every authorization decision

Every authorization decision answers three questions together:

1. **Who** is the principal? (from authN)
2. **What role** do they hold **in the relevant tenant**?
3. **Does the target resource belong to that same tenant?**

The tenant is **derived from the authenticated principal's membership, never
from client input** — no `tenant_id` from a body, query string, or header is
trusted. PostgreSQL RLS is the backstop: even a missed application-level check
cannot return another tenant's rows (see
[`TENANT_ISOLATION.md`](./TENANT_ISOLATION.md)). This is defense in depth, not
a substitute for explicit checks.

---

## 6. API dependency pattern (FastAPI)

Authorization is expressed as reusable FastAPI dependencies so that endpoints
declare their requirements and cannot forget them. The pattern:

```python
# Illustrative, not final code.

async def get_current_principal(token: str = Depends(bearer)) -> Principal:
    # Verify token, load authenticated user + tenant membership.
    # Raises 401 if authN fails.
    ...

async def get_tenant_context(
    principal: Principal = Depends(get_current_principal),
) -> TenantContext:
    # Derive tenant from the principal's membership. NEVER from client input.
    # Set the PostgreSQL RLS session variable for this request/connection.
    ...

def require_role(*allowed: Role):
    async def _dep(ctx: TenantContext = Depends(get_tenant_context)) -> TenantContext:
        if ctx.role not in allowed:
            raise HTTPException(403)  # deny by default
        return ctx
    return _dep

@router.post("/assessments/{id}/remediation/approve")
async def approve_remediation(
    id: UUID,
    ctx: TenantContext = Depends(require_role(Role.OWNER, Role.ADMIN)),
):
    # ctx.tenant_id is authoritative; the resource is fetched tenant-scoped,
    # and RLS guarantees cross-tenant rows are invisible.
    # Emit an audit event for this privileged action.
    ...
```

Key properties of the pattern:

- `get_tenant_context` is the **single place** tenant identity is established,
  and it sets the RLS session variable — every downstream query is
  tenant-scoped automatically.
- `require_role(...)` makes authZ a declarative, deny-by-default gate on the
  endpoint signature.
- Resource lookups are always tenant-scoped; RLS turns cross-tenant access
  into not-found.
- Privileged handlers emit audit events.
