---
name: security-review
description: Review a diff for security, tenancy, and scope violations in AI PlatformTrust before merge. Use on any change touching auth, data access, connectors, migrations, or AI output.
---

# Security Review

Review the diff against the platform's security and isolation guarantees. Flag and
block on any violation.

## Checklist

### Tenancy and isolation
- Is `tenant_id` present on every new tenant-owned table, and derived only from the
  authenticated context (never client input)?
- Is RLS enabled with a correct policy on new tenant-owned tables?
- Do queries and services scope by tenant, backed by RLS?

### Authorization
- Is authz enforced server-side for both action and target resource?
- Are privileged actions rejected for unauthorized/other-tenant callers?
- Does the UI avoid being the only access control?

### Secrets and data
- Any secrets, credentials, tokens, connection strings, PII, or customer data in
  code, fixtures, logs, or error messages? (Block.)
- Are logs free of raw payloads/tokens?
- Is evidence/sensitive data encrypted in transit and at rest?

### Input and queries
- Are all inputs (client, connector, events) validated at the boundary?
- Parameterized queries only — no string-built SQL/shell/paths?

### Connectors
- Read-only by default? No over-broad scopes? Provider formats contained in the
  adapter and events normalized + schema-validated?

### AI safety
- Does any LLM output decide pass/fail/authz/compliance/risk/score? (Block.)
- Is machine-readable AI output schema-validated and fail-closed?
- Is remediation gated on human approval? No PII/secrets in prompts?

### Migrations
- New migration only (no edits to committed ones)? Reversible? RLS + tenant_id
  included?

### Audit
- Is every privileged/state-changing action audited (who/what/when UTC/tenant/outcome)?

## Additional Considerations 
Review only:

* authentication
* authorization
* tenant boundaries
* secrets
* file handling
* injection risks
* logging
* dependency risk
* AI-specific threats

## Output
A findings list categorized **blocker / should-fix / nit**, each with file:line and a
concrete remediation. Approve only when no blockers remain.
