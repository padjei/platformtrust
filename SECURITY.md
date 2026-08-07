# Security Policy

Security is foundational to PlatformTrust, a multi-tenant AI Trust Operations
Platform. This document explains how to report vulnerabilities and describes our
baseline security practices.

## Reporting a vulnerability (private disclosure)

**Do not open a public GitHub issue for a security vulnerability.** Public
disclosure of an active, unpatched vulnerability — including exploit details or
proof-of-concept code — puts every tenant at risk and is not permitted.

Report suspected vulnerabilities **privately** through one of:

- GitHub's private vulnerability reporting for this repository
  (**Security → Report a vulnerability**), if enabled; or
- Email to:

  > **security@platformtrust.example** > _(placeholder — replace with the real security contact before launch)_

Include, where possible:

- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof of concept.
- Affected component(s) and version(s) or commit SHA.

We will acknowledge receipt, investigate, and coordinate a fix and a disclosure
timeline with you. Please give us reasonable time to remediate before any public
disclosure (coordinated disclosure).

## Secret exposure response

Treat any secret that reaches version control — a credential, token, private
key, connection string, or API key — as **compromised the moment it is
committed**, even if the commit is never pushed to a shared branch or is quickly
reverted.

If a secret is exposed:

1. **Rotate/revoke it immediately.** Assume it is already captured. Rotation is
   the only reliable remediation.
2. **Do not rely on deleting it from git history.** Rewriting history (or force
   pushing) is **not sufficient** — clones, forks, caches, CI logs, and mirrors
   may retain the value. Removing it from history is a cleanup step, never a
   substitute for rotation.
3. **Report it** through the private channel above so it can be tracked and any
   downstream impact assessed.

Preventive requirements:

- **Never commit secrets, credentials, tokens, PII, or customer data** to the
  repository, logs, test fixtures, screenshots, or prompts.
- `.env.example` contains **placeholders only** and must never hold real values.
  Load real secrets from the environment / Azure Key Vault at runtime.

## Encryption

- **In transit:** all external traffic uses TLS (HTTPS); service-to-service
  traffic is encrypted in transit.
- **At rest:** databases, evidence storage, and secrets are encrypted at rest via
  platform-managed encryption and a key vault.

## Tenant isolation

Every tenant-owned record carries a `tenant_id`. Isolation is enforced both in
the API layer and by PostgreSQL Row-Level Security (RLS). RLS must never be
disabled or bypassed, and `tenant_id` must never be derived from client input.

## Supported releases

_(placeholder policy — confirm before launch)_

During the MVP phase, only the current `main` branch and the latest tagged
release receive security updates.

| Version          | Supported |
| ---------------- | --------- |
| `main` (current) | Yes       |
| Latest release   | Yes       |
| Older releases   | No        |

## Compliance status

PlatformTrust does **not** currently claim any compliance certification,
including but not limited to **SOC 2, ISO 27001, FedRAMP, HIPAA, or CMMC**. The
platform helps organizations assess _their_ AI readiness; it is not itself
certified against these frameworks, and it must not be represented as certified.
