# Data Classification

This document defines how data in AI PlatformTrust is classified and the
handling requirements for each level. Classification drives storage,
encryption, access control, logging, and retention decisions.

Related documents:

- [`THREAT_MODEL.md`](./THREAT_MODEL.md) — assets and threats (authoritative).
- [`TENANT_ISOLATION.md`](./TENANT_ISOLATION.md) — isolation of tenant data.
- [`AUTHORIZATION_MODEL.md`](./AUTHORIZATION_MODEL.md) — who may access what.

> **Rule of thumb:** when unsure, classify *higher*. Never place real
> customer data or PII in fixtures, screenshots, logs, or prompts.

---

## 1. Classification levels

| Level | Definition | Impact if disclosed |
|-------|------------|---------------------|
| **Public** | Intended for open distribution. | None |
| **Internal** | Non-sensitive operational data; not for public release. | Low |
| **Confidential** | Sensitive business/tenant data; disclosure harms a tenant or the platform. | High |
| **Restricted / PII** | Highly sensitive: personal data, secrets, credentials, or customer evidence. | Severe |

---

## 2. Examples in this product

| Data | Level | Notes |
|------|-------|-------|
| Marketing content, public docs, this framework's control catalog descriptions (non-tenant) | Public | Control library *definitions* are Internal; published summaries may be Public |
| Aggregated, anonymized product metrics; non-sensitive config; code | Internal | No tenant attribution |
| Control library and scoring logic | Internal | Integrity-sensitive (tampering changes results) |
| Tenant org profile, assessment records, control results, gap findings, remediation roadmaps | Confidential | Tenant-scoped; cross-tenant disclosure is the top risk |
| Audit log entries | Confidential | Integrity-critical; no sensitive payloads inside |
| Users, roles, tenant membership | Confidential | Elevation-of-privilege target |
| **Evidence files** (uploads, screenshots, exports, connector pulls) | **Restricted / PII** | May contain PII/secrets the customer did not intend to share |
| Connector API keys/tokens, DB creds, LLM keys, signing keys, session tokens | **Restricted / PII** | Secrets — Key Vault only |
| Any personal data (names, emails, contact info) about customer staff | **Restricted / PII** | Minimize collection |

---

## 3. Handling requirements per level

Requirements are cumulative: each level adds to the one above it.

### Public
- No access restriction.
- Still review before release to confirm nothing higher slipped in.

### Internal
- Access limited to authenticated platform users/staff.
- Not exposed on unauthenticated endpoints.
- TLS in transit.

### Confidential
- **Tenant-scoped access only** — enforced server-side and via PostgreSQL RLS
  (see [`TENANT_ISOLATION.md`](./TENANT_ISOLATION.md)).
- Authorization checked on every access (see
  [`AUTHORIZATION_MODEL.md`](./AUTHORIZATION_MODEL.md)).
- Encrypted in transit and at rest.
- Every privileged access/modification emits an audit event (fact only, no
  sensitive payload).
- Never logged in full; never sent to an LLM unless minimized and justified.

### Restricted / PII
- All Confidential requirements, plus:
- **Secrets** live only in Azure Key Vault, retrieved via managed identity;
  never in source, env dumps, DB plaintext, logs, or error messages.
- **Evidence files** stored in Azure Blob, encrypted at rest, in
  tenant-partitioned paths, accessed via short-lived scoped tokens.
- Least-privilege access; access is logged.
- Never placed in fixtures, screenshots, prompts, or test data.
- Redact/minimize before any processing that leaves the trust boundary
  (e.g., LLM calls).

---

## 4. Evidence file handling

Evidence is the most sensitive tenant content and is treated as **untrusted
input** and **Restricted/PII** by default.

1. **Ingestion** — validate type and size; treat as untrusted (no execution,
   no server-side rendering of active content); scan uploads.
2. **Storage** — Azure Blob, encrypted at rest, tenant-partitioned path;
   content hash recorded for integrity; versioned/immutable where possible.
3. **Access** — authZ check + tenant scope on every request; short-lived
   scoped access tokens (no public URLs, no long-lived SAS).
4. **In transit** — TLS end to end.
5. **Use in scoring** — evidence is *input* to human-reviewed, deterministic
   assessment; it never itself sets a score.
6. **LLM use** — only minimized/redacted content may be included in prompts,
   and only when justified; prompts are a disclosure channel (see
   [`THREAT_MODEL.md`](./THREAT_MODEL.md#6-llm-specific-threats)).
7. **Logging** — log the fact of upload/access (actor, tenant, evidence id),
   never the file contents.

---

## 5. Retention

| Data | Retention guidance |
|------|--------------------|
| Evidence files | Retained for the life of the associated assessment plus the contractual retention window; deleted on tenant offboarding or verified deletion request |
| Assessment results, gaps, roadmaps | Retained per tenant contract; deleted on offboarding |
| Audit log | Retained long enough to meet accountability needs; append-only; not deleted casually |
| Secrets | Rotated regularly; revoked immediately on suspected compromise; never retained after connector removal |
| Backups | Encrypted; same tenant-isolation and retention rules apply |
| Logs (operational) | Time-boxed; scrubbed of sensitive data before storage |

Deletion must cover primary store, blob storage, and backups. Deletion of
tenant data is a privileged action and is audited.

---

## 6. Prohibited practices

- Committing any Restricted/PII data (secrets, credentials, customer data) to
  the repo.
- Real customer data in fixtures, screenshots, logs, or prompts — use
  synthetic data.
- Logging full evidence content, secrets, or PII.
- Sending unminimized Confidential/Restricted data to external services.
