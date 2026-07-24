# Security Policy

Security is foundational to AI PlatformTrust, a multi-tenant AI Trust Operations
Platform. This document explains how to report vulnerabilities and describes our
baseline security practices.

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Report suspected vulnerabilities privately via email to:

> **security@platformtrust.example** *(placeholder — replace with the real
> security contact before launch)*

Include, where possible:

- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof of concept.
- Affected component(s) and version(s).

We will acknowledge receipt, investigate, and coordinate a fix and disclosure
timeline with you. Please give us a reasonable time to remediate before any
public disclosure.

## Secrets, PII, and customer data

- **Never commit secrets, credentials, API keys, PII, or customer data** to the
  repository. Use `.env` (git-ignored) locally and Azure Key Vault in deployed
  environments.
- `.env.example` contains **placeholders only** and must never hold real values.
- Report any accidental secret exposure immediately so it can be rotated.

## Encryption

- **In transit:** all external traffic uses TLS (HTTPS). Service-to-service
  traffic is encrypted in transit.
- **At rest:** databases, Azure Blob Storage evidence, and secrets in Azure Key
  Vault are encrypted at rest.

## Tenant isolation

Every tenant-owned record carries a `tenant_id`. Isolation is enforced both in
the API layer and by PostgreSQL Row-Level Security (RLS). RLS must never be
disabled or bypassed.

## Supported versions

Only the latest released version and the current `main` branch receive security
updates during the MVP phase.

| Version           | Supported |
|-------------------|-----------|
| `main` (current)  | Yes       |
| Latest release    | Yes       |
| Older releases    | No        |

## Compliance status

AI PlatformTrust does **not** currently claim any compliance certification,
including but not limited to **SOC 2, ISO 27001, FedRAMP, HIPAA, or CMMC**.
The platform helps organizations assess *their* AI readiness; it is not itself
certified against these frameworks. Do not represent it as certified.
