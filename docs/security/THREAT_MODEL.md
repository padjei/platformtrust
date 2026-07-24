# Threat Model

> **Status:** Authoritative. This document is the canonical reference for
> platform threats and mitigations. Other security and architecture docs link
> back here. Update it whenever a new asset, trust boundary, connector, or
> external dependency is introduced.

AI PlatformTrust is a multi-tenant AI Trust Operations Platform. It assesses
AI readiness, identifies gaps, produces remediation roadmaps, and later
converts approved controls into continuous monitors. Because it aggregates
sensitive posture data from many organizations into one system, a breach of
tenant isolation or evidence confidentiality is the most damaging outcome we
can suffer. This model uses the STRIDE methodology (Spoofing, Tampering,
Repudiation, Information Disclosure, Denial of Service, Elevation of
Privilege).

Related documents:

- [`TENANT_ISOLATION.md`](./TENANT_ISOLATION.md) — how isolation is enforced.
- [`AUTHORIZATION_MODEL.md`](./AUTHORIZATION_MODEL.md) — roles and authZ.
- [`DATA_CLASSIFICATION.md`](./DATA_CLASSIFICATION.md) — data sensitivity levels.
- [`SECURE_SDLC.md`](./SECURE_SDLC.md) — how threats are managed over the lifecycle.

---

## 1. Assets

The value we protect, in rough order of sensitivity.

| Asset | Description | Classification | Primary concern |
|-------|-------------|----------------|-----------------|
| **Tenant data** | Assessments, control results, gap findings, remediation roadmaps, org profile for each customer. | Confidential / Restricted | Cross-tenant disclosure |
| **Evidence files** | Customer-uploaded documents, screenshots, exports, connector pulls used to substantiate control answers. May contain PII or secrets the customer did not intend to share. | Restricted | Confidentiality, integrity |
| **Credentials & secrets** | Connector API keys/tokens, DB credentials, LLM API keys, Blob/Key Vault access, signing keys, session tokens. | Restricted | Theft, misuse |
| **Audit log** | Immutable record of privileged and security-relevant actions. | Confidential | Integrity, non-repudiation |
| **Identity & authZ data** | Users, roles, tenant membership, permission grants. | Confidential | Elevation of privilege |
| **Scoring logic & control library** | Deterministic scoring engine and control definitions. | Internal | Integrity (tampering changes results) |
| **Platform availability** | The service itself. | — | Denial of service |

See [`DATA_CLASSIFICATION.md`](./DATA_CLASSIFICATION.md) for the level
definitions and handling rules referenced above.

---

## 2. Trust boundaries

Data crosses a trust boundary any time it moves between components with
different levels of trust. Each crossing is a place to authenticate,
authorize, validate, and log.

```
 [ Browser / Next.js ]  --(HTTPS, session/JWT)-->  [ FastAPI ]
                                                       |
        +----------------------+----------------------+----------------------+
        |                      |                      |                      |
   [ PostgreSQL + RLS ]  [ Azure Blob ]        [ Connectors ]          [ LLM provider ]
   (tenant data,         (evidence,            (Salesforce, cloud,     (explanation
    audit log)            encrypted)            SaaS - untrusted)       generation only)
                                                       |
                                                [ Azure Key Vault ]
                                                (secrets at rest)
```

| # | Boundary | Trusted side | Untrusted / lower-trust side | Controls at the boundary |
|---|----------|--------------|------------------------------|--------------------------|
| B1 | Browser ↔ API | API | Browser input, session token | TLS, authN, input validation, CSRF/session hardening, server-side authZ |
| B2 | API ↔ PostgreSQL | API | (internal, but tenant mixing risk) | Parameterized queries, RLS, per-request tenant session variable |
| B3 | API ↔ Blob | API | Stored evidence blobs | Encryption at rest + in transit, scoped SAS/short-lived access, tenant-partitioned paths |
| B4 | API ↔ Connectors | API | **Connector-returned data (untrusted)** | Read-only default scopes, output validation, egress control, secret storage in Key Vault |
| B5 | API ↔ LLM | API | **LLM output (untrusted)** | Prompt hygiene, schema-validated output, LLM never decides pass/fail or scores |
| B6 | API/services ↔ Key Vault | API | (secret retrieval) | Managed identity, least privilege, no secrets in code/env dumps |

Client-supplied input — including any `tenant_id` — is untrusted at every
boundary. Tenant identity is always derived from the authenticated context
server-side (see [`TENANT_ISOLATION.md`](./TENANT_ISOLATION.md)).

---

## 3. Top risk: cross-tenant access

**Cross-tenant data access is the single highest-impact threat to this
platform.** A multi-tenant trust product that leaks one customer's readiness
posture, gaps, or evidence to another customer causes catastrophic loss of
trust and likely contractual/legal consequences. It is treated as a Sev-1
class defect.

Attack paths we defend against:

- A client sends a forged or swapped `tenant_id` in a request body, query
  param, or header. **Mitigation:** tenant is never read from client input;
  it is derived from the authenticated principal's membership.
- An application query forgets a `WHERE tenant_id = ?` clause.
  **Mitigation:** PostgreSQL Row-Level Security is the backstop — RLS policies
  filter every row by the session tenant variable even if application code
  errs. Defense in depth (see B2).
- An `IDOR` on a resource id (assessment, evidence, control result) returns
  another tenant's object. **Mitigation:** every fetch is scoped to the
  session tenant; RLS makes cross-tenant rows invisible, so the lookup returns
  not-found rather than another tenant's data.
- Evidence blob path guessing. **Mitigation:** tenant-partitioned storage
  paths plus authZ check plus short-lived scoped access tokens; no public
  blobs.
- Background jobs / async workers running without a tenant context.
  **Mitigation:** jobs carry explicit tenant context and set the RLS session
  variable before touching data.

Required isolation tests are defined in
[`TENANT_ISOLATION.md`](./TENANT_ISOLATION.md#required-isolation-tests) and are
a merge gate.

---

## 4. STRIDE threats and mitigations

### Spoofing (authenticity)

| Threat | Mitigation |
|--------|------------|
| Stolen/replayed session tokens | Short-lived tokens, secure+httpOnly cookies, TLS only, rotation, revocation on logout |
| Impersonating another user or tenant | Server-side authN on every request; tenant/user derived from verified token, never from client fields |
| Spoofed connector callbacks/webhooks | Signature verification, allow-listed sources, no implicit trust of inbound connector data |
| Service-to-service spoofing (Key Vault, Blob) | Azure Managed Identity, no shared static credentials |

### Tampering (integrity)

| Threat | Mitigation |
|--------|------------|
| SQL injection altering or exfiltrating data | Parameterized queries / ORM binding only; no string-built SQL |
| Tampering with control results or scores | Deterministic scoring engine; results derived from validated inputs; LLM output cannot set pass/fail (see [`../frameworks/SCORING_MODEL.md`](../frameworks/SCORING_MODEL.md)) |
| Modifying evidence after upload | Content hashing, immutable/versioned storage, encryption at rest |
| Audit log tampering | Append-only design, restricted write path, integrity checks |
| Tampering via malicious uploads | Treat uploads as untrusted: type/size validation, scanning, no execution, isolated storage |

### Repudiation (accountability)

| Threat | Mitigation |
|--------|------------|
| User denies performing a privileged action | Every privileged action emits an audit event (actor, tenant, action, target, timestamp) |
| Missing trail for approvals | Human approval of remediation is recorded as an audit event with the approver identity |
| Ambiguous automated actions | Automated/monitor actions are attributed to a service principal in the log |

Audit events log the *fact* of an action, never sensitive payloads (see
[`DATA_CLASSIFICATION.md`](./DATA_CLASSIFICATION.md)).

### Information Disclosure (confidentiality)

| Threat | Mitigation |
|--------|------------|
| **Cross-tenant disclosure** | See [Section 3](#3-top-risk-cross-tenant-access); RLS + server-derived tenant + authZ |
| Secrets in code, logs, or errors | Key Vault for secrets, gitleaks in CI, log scrubbing, generic error responses |
| PII in evidence exposed broadly | Restricted classification handling, least-privilege access, encryption |
| Verbose errors/stack traces to clients | Sanitized error responses; details only to server logs |
| Sensitive data sent to LLM | Minimize/redact prompt content; treat prompts as a disclosure channel |

### Denial of Service (availability)

| Threat | Mitigation |
|--------|------------|
| Request flooding | Rate limiting, per-tenant quotas, autoscaling on Container Apps |
| Large/malicious file uploads | Size limits, streaming, quotas |
| Expensive LLM/connector fan-out | Timeouts, concurrency caps, per-tenant budgets |
| Poison inputs causing heavy processing | Input validation and bounded work per request |

### Elevation of Privilege (authorization)

| Threat | Mitigation |
|--------|------------|
| Viewer performing Admin/Owner actions | Server-side role checks on every privileged endpoint (see [`AUTHORIZATION_MODEL.md`](./AUTHORIZATION_MODEL.md)) |
| Escaping tenant scope to platform-level access | Platform roles separated from tenant roles; explicit checks |
| Privilege via mass-assignment / hidden fields | Strict input schemas; role/tenant fields never client-settable |
| Connector token over-scope | Default read-only connector permissions; least privilege |

---

## 5. Connector-specific threats

Connectors (Salesforce and future cloud/SaaS integrations) pull data from
external systems into the platform. Salesforce is a *connector, not a
dependency* — the platform must function without it.

| Threat | Mitigation |
|--------|------------|
| Malicious or malformed connector responses (injection, oversized payloads, unexpected schema) | **All connector data is untrusted input.** Validate and normalize against expected schemas before use; bound sizes |
| Over-privileged connector credentials | **Default connector permissions are read-only**; request least privilege; document any write scope |
| Credential theft from connector config | Store connector secrets in Key Vault, never in DB plaintext or logs |
| Connector used as SSRF / pivot | Egress allow-listing, no arbitrary URLs from client, timeouts |
| Data from connector attributed to wrong tenant | Connector configs are tenant-scoped; ingested data written under the owning tenant only, with RLS enforced |
| Connector compromise cascading into scoring | Connector data is evidence input, not an authority; scoring remains deterministic and human-reviewed |

---

## 6. LLM-specific threats

The LLM assists with explanation, summarization, and drafting only. It is a
lower-trust component and its output is untrusted.

Hard rules (enforced platform-wide):

- **LLM output never determines** control pass/fail, authorization, compliance
  status, production changes, or final risk scores.
- **AI machine-readable output must be schema validated** before any use.
- **Production remediation requires explicit human approval.**

| Threat | Mitigation |
|--------|------------|
| Prompt injection via evidence/connector content | Treat retrieved content as data, not instructions; constrain the model's role; validate outputs |
| LLM hallucination influencing results | LLM cannot set scores or pass/fail; deterministic engine owns all decisions ([`../frameworks/SCORING_MODEL.md`](../frameworks/SCORING_MODEL.md)) |
| Sensitive data leaked to the model provider | Minimize/redact prompt content; classify what may be sent; contractual data-handling terms |
| Malformed/oversized model output breaking downstream | Strict schema validation and size limits on machine-readable output |
| Model output rendered unsafely in UI | Output encoding/sanitization; no raw HTML/script execution from model text |
| Over-reliance / automation bias | Human-in-the-loop approval for remediation; explanations labeled as AI-generated |

---

## 7. Residual risk and review

- No credentials, secrets, tokens, private keys, customer data, or PII are
  ever committed to the repository or placed in fixtures, screenshots, logs,
  or prompts.
- Threats are re-evaluated per feature during design (see
  [`SECURE_SDLC.md`](./SECURE_SDLC.md)); new trust boundaries or connectors
  require an update to this document.
- Compliance/certification claims (SOC 2, ISO 27001, FedRAMP, HIPAA, CMMC)
  are not made without documented proof; alignment mappings are informational
  only (see [`../frameworks/NIST_AI_RMF_MAPPING.md`](../frameworks/NIST_AI_RMF_MAPPING.md)).
