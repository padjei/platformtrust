# Secure Coding Standard

| Attribute        | Value                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| Document owner   | PlatformTrust Engineering                                                    |
| Approver         | Product and Engineering Leadership                                           |
| Classification   | Internal                                                                     |
| Related issue    | PT-002 §5                                                                    |
| Applies to       | All PlatformTrust application, worker, AI-service, package, and script code  |

---

## 1. Purpose

This standard translates the PlatformTrust security principles into concrete,
reviewable coding rules. It exists so that every contributor and reviewer can
answer a single question consistently: **does this change meet PlatformTrust's
secure-coding bar?**

It operationalizes the Constitution's security posture — Zero Trust
([Article III](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-iii--zero-trust-is-the-default)),
Deny by Default
([Article IV](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-iv--deny-by-default)),
and Security as a product requirement
([Article V](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-v--security-is-a-product-requirement)) —
into rules that a reviewer can check against a diff.

This standard does **not** define the final authentication, authorization,
tenant-persistence, or cryptography architecture. Those are material decisions
reserved for future Architecture Decision Records (see
[Handbook §10.1](../handbook/ENGINEERING_HANDBOOK.md#101-when-an-adr-is-required)).
Until such an ADR is accepted, this standard states provider-neutral
**requirements** that any future design MUST satisfy.

## 2. Scope

This standard applies to all first-party code in the repository, including:

- `apps/web`, `apps/api`, `apps/worker` (TypeScript / NestJS / Next.js).
- `apps/ai-service` (Python 3.12 / FastAPI).
- `packages/*` shared libraries.
- `scripts/*` and infrastructure glue committed to the repository.

It applies to all untrusted input, which includes client requests, connector and
provider payloads, uploaded files, external events, environment configuration,
and any AI-model output consumed by downstream systems.

It does **not** restate the full Constitution or Handbook; it links back to them
and adds enforceable detail. Where this standard and a higher authority conflict,
the precedence order in
[Constitution §2](../constitution/PLATFORMTRUST_CONSTITUTION.md#2-authority-and-precedence)
governs, and the conflict MUST be surfaced rather than silently resolved.

## 3. Mandatory requirements

### 3.1 Deny by default

- Every protected operation MUST fail closed. If an authorization, tenant, or
  validation check cannot be evaluated, the operation MUST be denied.
- The absence of an explicit grant MUST NOT be interpreted as permission
  ([Article IV](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-iv--deny-by-default)).
- New endpoints, jobs, events, and AI tools MUST start from no access and add
  narrow, explicit grants.

### 3.2 Server-side authorization

- Authorization MUST be enforced on the server for both the **action** and the
  **target resource**, on every request, independent of any client-side check
  ([Handbook §18](../handbook/ENGINEERING_HANDBOOK.md#18-authentication-and-authorization)).
- Authentication and authorization MUST be treated as distinct concerns; proving
  identity MUST NOT be treated as proof of permission.
- UI state (hidden or disabled controls) MUST NOT be relied on as an access
  control. Business logic and entitlement checks MUST NOT exist only in the
  frontend
  ([Article VIII](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-viii--apis-are-versioned-contracts)).
- Authorization decisions on privileged or state-changing actions MUST be
  auditable (see [§3.11](#311-security-relevant-events-must-be-auditable)).
- The concrete authorization model (roles, permissions, policy engine, identity
  provider) is **deferred to a future ADR**. Placeholder auth types MUST NOT
  imply that access control is implemented.

### 3.3 Tenant context is never trusted from the client

- Tenant context MUST be derived from the authenticated principal on the server.
  It MUST NOT be read from a request body, query parameter, header, path segment,
  cookie, or any other client-supplied value.
- Every access to a tenant-owned resource MUST be constrained to the caller's
  resolved tenant. Cross-tenant access is prohibited unless it meets every
  condition in
  [Article I](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-i--multi-tenancy-is-mandatory)
  (explicit use case, approval, authorized actor, audit, passed security review).
- Frontend filtering MUST NOT be treated as a tenant-isolation control.
- Tenant isolation MUST be verified with negative tests, per
  [`TESTING_STANDARD.md`](./TESTING_STANDARD.md) and
  [Handbook §19](../handbook/ENGINEERING_HANDBOOK.md#19-tenant-isolation-testing).
- The persistence-layer isolation mechanism (database, schema strategy, row
  filtering) is **deferred to a future data ADR**; this requirement is
  independent of that choice.

### 3.4 Input validation and output encoding

- All external input MUST be validated at the trust boundary against an explicit
  schema before use. TypeScript code MUST validate with a schema (for example
  Zod) at the boundary; Python code MUST validate with Pydantic models
  ([Handbook §15](../handbook/ENGINEERING_HANDBOOK.md#15-coding-standards)).
- Validation MUST constrain type, format, length, range, and allowed values, and
  SHOULD reject unknown or extra fields where the contract is closed.
- Output MUST be encoded for its destination context (HTML, attribute, URL,
  shell, SQL/data-access parameter, log field). Encoding MUST match the sink, not
  the source.
- Validation failures MUST return a distinct, structured error that is
  distinguishable from authorization, not-found, and internal errors, per
  [`ERROR_HANDLING_STANDARD.md`](./ERROR_HANDLING_STANDARD.md).

### 3.5 Safe data access (once persistence exists)

- Once a persistence layer is introduced, all data access MUST use parameterized
  queries or a vetted query-builder / data-mapper that parameterizes by default.
- User, connector, or AI-derived values MUST NOT be concatenated or interpolated
  into query, filter, or command strings.
- This standard does **not** select a database, ORM, or query technology; those
  are **deferred to a future data ADR**. The parameterization requirement applies
  regardless of which technology is later chosen.

### 3.6 Secret management rules (provider-neutral)

- Secrets MUST NOT appear in source control, including code, fixtures,
  screenshots, tickets, comments, logs, and error messages
  ([Article XIX](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xix--infrastructure-must-be-reproducible);
  [Handbook §22](../handbook/ENGINEERING_HANDBOOK.md#22-secret-management)).
- Secrets MUST be supplied to the running process at runtime (for example via
  environment or an approved secret source). Only placeholder values belong in
  `.env.example`.
- Secrets MUST be scoped by environment, access-controlled, rotatable, revocable,
  and owned.
- A committed secret MUST be treated as compromised. It MUST be rotated;
  **deleting it from Git history is not sufficient** and MUST NOT be treated as
  remediation.
- The secret-manager vendor and key-management architecture are **deferred to a
  future ADR**. These rules apply regardless of the vendor later chosen.

### 3.7 Sensitive-data minimization

- Code MUST collect, process, transmit, retain, and expose only the data required
  for the approved purpose
  ([Article VI](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-vi--privacy-and-data-minimization)).
- Sensitive data MUST NOT be placed in logs, telemetry, analytics, prompts, error
  messages, or test fixtures unless explicitly approved and protected (see also
  [Handbook §23](../handbook/ENGINEERING_HANDBOOK.md#23-logging-standards)).
- Production customer data MUST NOT be copied into lower environments without an
  approved sanitization process.

### 3.8 Common web and injection vulnerability classes

Code MUST be written to prevent the following classes. Each item below is a
reviewable requirement.

- **Injection (SQL, NoSQL, LDAP, expression, template):** use parameterization
  and safe APIs; never build interpreted strings from untrusted input
  ([Handbook §16](../handbook/ENGINEERING_HANDBOOK.md#16-api-standards)).
- **Command execution:** avoid spawning shells; when a subprocess is unavoidable,
  pass an argument array (never a shell string) and never include untrusted input
  in the command.
- **Cross-site scripting (XSS):** rely on framework escaping; never render
  untrusted HTML. `dangerouslySetInnerHTML` and equivalent raw-HTML sinks MUST
  NOT receive user- or connector-derived content.
- **Cross-site request forgery (CSRF):** state-changing browser-driven endpoints
  MUST use an anti-CSRF mechanism appropriate to the chosen session model.
- **Server-side request forgery (SSRF):** outbound requests to
  caller-influenced URLs MUST validate the target against an allowlist and MUST
  NOT follow requests to internal/metadata addresses.
- **Path traversal:** file paths MUST be resolved and confirmed to remain within
  an intended base directory; raw user input MUST NOT be used as a path.
- **Open redirect:** redirect targets MUST be validated against an allowlist of
  permitted destinations.
- **Insecure deserialization:** untrusted data MUST NOT be deserialized into
  executable objects; use data-only formats and schema validation.

### 3.9 Safe file handling

- Uploaded and connector-provided files MUST be treated as untrusted input:
  validated for type and size, stored outside executable paths, and never
  executed.
- File names and paths derived from input MUST be sanitized and confined to an
  intended directory (see path traversal, [§3.8](#38-common-web-and-injection-vulnerability-classes)).
- File upload is a security-review trigger (see
  [§6](#6-enforcement-mechanisms) and
  [Handbook §20](../handbook/ENGINEERING_HANDBOOK.md#20-security-engineering)).

### 3.10 Cryptography

- Code MUST use approved, vetted platform or library cryptographic primitives for
  hashing, encryption, signing, and random-number generation.
- Code MUST NOT implement custom cryptographic algorithms, custom key-derivation,
  or ad-hoc "encryption" (for example XOR or home-grown obfuscation).
- Security-sensitive randomness MUST use a cryptographically secure source, not a
  general-purpose pseudo-random generator.
- This standard does **not** select a specific cryptography library or key-
  management design; those are **deferred to a future ADR**. Introducing
  cryptography is a security-review trigger
  ([Handbook §20](../handbook/ENGINEERING_HANDBOOK.md#20-security-engineering)).

### 3.11 Security-relevant events MUST be auditable

- Privileged and state-changing actions — including authorization failures,
  role/permission changes, exports, administrative operations, and remediation —
  MUST emit durable audit events
  ([Article II](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-ii--every-significant-action-must-be-auditable)).
- Audit records MUST identify the tenant, actor, action, resource, outcome, and a
  request/correlation identifier where applicable, and MUST NOT be silently
  altered or deleted.
- Audit records MUST NOT contain secrets or unnecessary sensitive data.

### 3.12 Safe error behavior

- Code MUST NOT return raw stack traces, database queries, internal hostnames,
  secrets, provider credentials, or system configuration to clients
  ([Handbook §24](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling)).
- Error handling MUST follow [`ERROR_HANDLING_STANDARD.md`](./ERROR_HANDLING_STANDARD.md);
  errors MUST NOT be silently swallowed.

### 3.13 Dependency and supply-chain security

- New dependencies MUST be justified (need, maintenance, license, security) and
  reviewed per [`DEPENDENCY_MANAGEMENT.md`](./DEPENDENCY_MANAGEMENT.md) and
  [Handbook §37](../handbook/ENGINEERING_HANDBOOK.md#37-dependency-management).
- Dependency and secret scanning run in CI (see
  [§6](#6-enforcement-mechanisms)); findings MUST be triaged, not ignored.

## 4. Prohibited practices

- MUST NOT trust a tenant identifier, role, or scope supplied by the client.
- MUST NOT enforce authorization or entitlements only in the frontend.
- MUST NOT interpolate untrusted input into SQL, shell, path, template, or
  expression strings.
- MUST NOT roll custom cryptography or use a non-cryptographic RNG for security.
- MUST NOT commit secrets; MUST NOT treat history rewriting as rotation.
- MUST NOT log or return secrets, PII, stack traces, or internal system detail.
- MUST NOT render untrusted content as raw HTML.
- MUST NOT follow caller-controlled outbound URLs without allowlisting (SSRF).
- MUST NOT execute or deserialize untrusted data into live objects.
- MUST NOT catch and discard errors without handling or structured logging.
- MUST NOT introduce a new dependency without justification and review.
- MUST NOT select a database, ORM, auth/identity provider, secret manager, or
  crypto library in code ahead of the governing ADR.

## 5. Examples

### 5.1 Tenant context resolved server-side (TypeScript, provider-neutral)

```ts
// GOOD: tenant is taken from the authenticated principal, never from input.
function resolveTenant(principal: AuthenticatedPrincipal): TenantId {
  return principal.tenantId;
}

// BAD: tenant taken from the request — spoofable, violates Article I.
function resolveTenantUnsafe(req: { body: { tenantId: string } }): string {
  return req.body.tenantId;
}
```

### 5.2 Input validation at the boundary (Python / Pydantic)

```python
from pydantic import BaseModel, Field


class CreateNoteRequest(BaseModel):
    model_config = {"extra": "forbid"}  # reject unknown fields

    title: str = Field(min_length=1, max_length=200)
    body: str = Field(max_length=10_000)
```

### 5.3 Avoiding command injection (Python)

```python
import subprocess

# GOOD: argument array, no shell, validated input.
def run_report(report_id: str) -> bytes:
    if not report_id.isalnum():
        raise ValueError("invalid report id")
    return subprocess.check_output(["report-tool", "--id", report_id])

# BAD: shell string built from input — command injection.
# subprocess.check_output(f"report-tool --id {report_id}", shell=True)
```

### 5.4 SSRF-safe outbound fetch (allowlist)

```ts
const ALLOWED_HOSTS = new Set(['connector.internal.example']);

function assertAllowedTarget(rawUrl: string): URL {
  const url = new URL(rawUrl);
  if (!ALLOWED_HOSTS.has(url.hostname)) {
    throw new ForbiddenTargetError(url.hostname);
  }
  return url;
}
```

## 6. Enforcement mechanisms

- **CI (`.github/workflows/ci.yml`):** `pnpm format:check`, `pnpm lint`,
  `pnpm typecheck`, `pnpm test`, `pnpm build`, and
  `node scripts/check-app-boundaries.mjs`. For `apps/ai-service`:
  `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy .`,
  `uv run pytest`.
- **CI (`.github/workflows/security.yml`):** secret scanning (gitleaks),
  `pip-audit`, and `pnpm audit` (advisory) for dependency risk.
- **TypeScript strict mode** via `tsconfig.base.json`; `any`/`@ts-ignore` used to
  hide real type or security problems is a review rejection.
- **Cross-app import ban** enforced by `scripts/check-app-boundaries.mjs`.
- **Pull request review** using `.github/pull_request_template.md` — reviewers
  MUST confirm the Security and Tenant-isolation sections
  ([Handbook §13](../handbook/ENGINEERING_HANDBOOK.md#13-pull-request-standards)).
- **Security review** is required before merge for changes that touch any trigger
  in [Handbook §20](../handbook/ENGINEERING_HANDBOOK.md#20-security-engineering):
  authentication, authorization, tenant isolation, new integrations, new public
  APIs, new AI providers, sensitive-data processing, file upload, export,
  administrative tools, cryptography, secrets handling, and high-impact
  automation.

## 7. Exception process

Exceptions to this standard MUST follow the no-silent-exceptions rule in
[Constitution §6](../constitution/PLATFORMTRUST_CONSTITUTION.md#6-exception-process).
A request MUST be explicit, temporary, and documented, and MUST record the rule
affected, the justification, the security and compliance impact, compensating
controls, the owner, the approver, an expiration date, and a remediation plan.
Silent exceptions are prohibited. Where a requirement conflicts with a ticket or
preference, implementation MUST stop at the affected boundary and escalate
([Constitution §3.3](../constitution/PLATFORMTRUST_CONSTITUTION.md#33-implementation-engineers-and-coding-agents)).

## 8. Related Constitution articles

- [Article I — Multi-Tenancy](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-i--multi-tenancy-is-mandatory)
- [Article II — Auditability](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-ii--every-significant-action-must-be-auditable)
- [Article III — Zero Trust](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-iii--zero-trust-is-the-default)
- [Article IV — Deny by Default](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-iv--deny-by-default)
- [Article V — Security Is a Product Requirement](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-v--security-is-a-product-requirement)
- [Article VI — Privacy and Data Minimization](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-vi--privacy-and-data-minimization)
- [Article VIII — APIs Are Versioned Contracts](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-viii--apis-are-versioned-contracts)
- [Article XIX — Infrastructure and Secrets](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xix--infrastructure-must-be-reproducible)
- [Article XX — Secure Software Supply Chain](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xx--secure-software-supply-chain)

## 9. Related Handbook sections

- [§15 — Coding Standards](../handbook/ENGINEERING_HANDBOOK.md#15-coding-standards)
- [§16 — API Standards](../handbook/ENGINEERING_HANDBOOK.md#16-api-standards)
- [§18 — Authentication and Authorization](../handbook/ENGINEERING_HANDBOOK.md#18-authentication-and-authorization)
- [§19 — Tenant Isolation Testing](../handbook/ENGINEERING_HANDBOOK.md#19-tenant-isolation-testing)
- [§20 — Security Engineering (review triggers)](../handbook/ENGINEERING_HANDBOOK.md#20-security-engineering)
- [§22 — Secret Management](../handbook/ENGINEERING_HANDBOOK.md#22-secret-management)
- [§23 — Logging Standards](../handbook/ENGINEERING_HANDBOOK.md#23-logging-standards)
- [§24 — Error Handling](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling)
- [§37 — Dependency Management](../handbook/ENGINEERING_HANDBOOK.md#37-dependency-management)

## 10. Related standards and ADRs

- [`ERROR_HANDLING_STANDARD.md`](./ERROR_HANDLING_STANDARD.md)
- [`TESTING_STANDARD.md`](./TESTING_STANDARD.md)
- [`DEPENDENCY_MANAGEMENT.md`](./DEPENDENCY_MANAGEMENT.md)
- [`AI_ENGINEERING_STANDARD.md`](./AI_ENGINEERING_STANDARD.md)
- [ADR-0002 — Initial Application Technology Stack](../adr/ADR-0002-initial-application-technology-stack.md)
</content>
</invoke>
