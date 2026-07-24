# connector-sdk

Shared SDK / adapter interface for building PlatformTrust connectors.

## Principles

- **Read-only by default.** Connectors read from providers; any write capability is opt-in,
  explicitly configured, and audited.
- **Normalize to the event schema.** Every connector maps provider data into the normalized
  PlatformTrust event envelope (`packages/event-schema`).
- **Credential handling via Key Vault.** Connectors never store secrets locally; credentials are
  fetched from Azure Key Vault at runtime and scoped per tenant.
- **Tenant-aware.** Every emitted event carries a `tenant_id`.

## Adapter contract (conceptual)

- `authenticate(config, credentials)` — establish a read-only session.
- `discover()` — list available data types/streams.
- `pull(cursor)` — fetch new data since the last cursor.
- `normalize(raw)` — map raw provider data to PlatformTrust events.
