# Security Rules

Security is non-negotiable. Every privileged action is authorized server-side and audited.

## Secrets and sensitive data
- **Do** load secrets from Azure Key Vault / environment at runtime; keep a
  `.env.example` with placeholders only.
- **Don't** ever commit secrets, credentials, tokens, connection strings, PII, or
  customer data to the repo, logs, test fixtures, or error messages.
- **Do** scrub secrets and PII from logs and exceptions before they are emitted.
- **Don't** print request bodies or connector payloads at info level.

## Authorization
- **Do** enforce authorization **server-side** on every request, for both the
  action and the target resource, scoped to the caller's `tenant_id`.
- **Do** derive `tenant_id` from the authenticated session/token, never from a
  client-supplied field, header, or body.
- **Don't** trust the client for identity, tenant, role, or scope. Re-check on the
  server every time.
- **Don't** rely on the UI hiding a control as an access control.

## Encryption
- **Do** encrypt all evidence and sensitive data **in transit (TLS) and at rest**.
- **Do** use platform-managed encryption (Azure) and Key Vault for key material.
- **Don't** roll your own crypto or store plaintext evidence.

## Input handling
- **Do** treat all inputs — client, connector, and external events — as untrusted.
  Validate and normalize at the boundary (Pydantic/Zod).
- **Do** use parameterized queries exclusively.
- **Don't** build SQL, shell, or path strings from user/connector input.

## Audit
- **Do** write an immutable audit event for every privileged or state-changing
  action (who, what, when in UTC, tenant, resource, outcome).
- **Don't** allow remediation, approvals, connector changes, or role changes to
  occur without a corresponding audit record.

## Claims and certification
- **Don't** state or imply the product provides certification, legal compliance
  guarantees, or that an LLM's judgment establishes compliance/risk/pass status.
  The platform assesses and reports; humans and deterministic rules decide.
