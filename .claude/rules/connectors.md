# Connector Rules

Connectors integrate external systems (Salesforce, clouds, tools). A connector is
an **adapter, never a core dependency**.

## Permissions
- **Do** default every connector to **read-only** scope.
- **Do** require explicit, audited, human-approved elevation for any write/remediation
  scope.
- **Don't** request broader OAuth scopes/permissions than the feature needs.
- **Don't** enable write access by default or silently.

## Boundaries and normalization
- **Do** keep **all provider-specific formats, auth, and quirks inside the adapter**.
- **Do** normalize every external event/record into the canonical **PlatformTrust
  event schema** before it leaves the adapter.
- **Don't** let provider payload shapes, field names, or enums leak into domain
  logic, storage, or the API.
- **Do** version adapters and isolate breaking provider changes to the adapter.

## Trust and safety
- **Do** treat **all connector data as untrusted input**: validate, size-limit, and
  sanitize before processing or storing.
- **Do** store connector credentials in Key Vault; scope them per tenant.
- **Don't** log raw connector payloads or tokens.
- **Don't** allow a connector to bypass tenant scoping — connector data is tagged
  with the owning `tenant_id`.

## Reliability
- **Do** handle rate limits, retries with backoff, and partial failures gracefully.
- **Do** make ingestion idempotent (dedupe on stable external ids).
- **Don't** let one provider outage cascade into core platform failure.

## Testing
- **Do** test parsing of valid, malformed, and hostile payloads, plus the
  normalization mapping. See `testing.md`.
