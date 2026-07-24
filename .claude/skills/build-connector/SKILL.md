---
name: build-connector
description: Build a new connector adapter for AI PlatformTrust — read-only by default, provider formats isolated in the adapter, events normalized to the PlatformTrust schema, with tests. Use when integrating an external system.
---

# Build a Connector

A connector is an adapter, not a core dependency. It ingests from an external
provider and normalizes into the canonical PlatformTrust event schema.

## Steps

1. **Define scope.** Identify the provider, the data/events needed, and the minimum
   permissions. Default to **read-only**; do not request write scopes.
2. **Auth and secrets.** Store credentials per tenant in Key Vault. Never hardcode
   or log tokens. Tag all ingested data with the owning `tenant_id`.
3. **Adapter boundary.** Put all provider-specific auth, pagination, formats, field
   names, and quirks **inside the adapter**. Nothing provider-specific leaves it.
4. **Normalization.** Map provider records/events to the **PlatformTrust event
   schema**. Validate the normalized output against its schema. Handle unknown
   fields safely.
5. **Untrusted input.** Treat all provider payloads as hostile: validate,
   size-limit, sanitize. Make ingestion idempotent (dedupe on stable external ids).
6. **Reliability.** Handle rate limits, retries with backoff, and partial failures.
   Ensure a provider outage cannot cascade into core failure.
7. **Tests.** Cover valid, malformed, and hostile payloads; the normalization
   mapping; idempotency; and that connector data respects tenant scoping. Use
   recorded fixtures with synthetic (non-real) data.
8. **Elevation (only if required).** Any write/remediation scope must be explicit,
   human-approved, and audited — never default.

## Additional Considerations 
Must:

* Follow the connector interface
* Use read-only permissions
* Add connection testing
* Add pagination
* Add retry handling
* Normalize events
* Add mock provider tests
* Document permissions
* Create threat-model notes

## Definition of Done
Read-only by default, provider formats contained in the adapter, events normalized
and schema-validated, tenant-scoped, tests green (including malformed payloads),
no secrets/PII in logs or fixtures.
