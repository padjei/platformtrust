# Connector Framework — AI PlatformTrust

> **Related docs:** [System Architecture](./SYSTEM_ARCHITECTURE.md) · [Event Model](./EVENT_MODEL.md) · [Domain Model](./DOMAIN_MODEL.md) · [Multi-Tenancy](./MULTI_TENANCY.md) · [MVP Scope](../product/MVP_SCOPE.md)

## 1. Purpose

Connectors let AI PlatformTrust gather evidence and signals from external systems **without coupling the core to any provider**. All provider-specific behavior lives inside a connector adapter; the core only ever sees data normalized to the [PlatformTrust event schema](./EVENT_MODEL.md). This is how the platform stays **cloud-, application-, and model-neutral** (see [Product Vision](../product/PRODUCT_VISION.md)).

**Salesforce is an initial connector, not a platform dependency.**

## 2. Core Rules

- **Read-only by default.** MVP connectors never mutate external systems. Write capability is out of scope (see [MVP Scope](../product/MVP_SCOPE.md) §4) and, in future phases, would require explicit approval and human sign-off.
- **Credentials via Azure Key Vault.** Adapters receive short-lived, resolved credentials; secrets are never stored in the database (only a `key_vault_ref` on [ConnectorAccount](./DOMAIN_MODEL.md)).
- **Normalize everything.** Provider formats are converted to the event schema inside the adapter.
- **Tenant-scoped.** Every pull runs under a resolved tenant context; output carries `tenant_id` (see [Multi-Tenancy](./MULTI_TENANCY.md)).
- **Deterministic mapping.** Normalization is deterministic; no LLM in the normalization path.

## 3. Adapter Interface

Every connector implements a common interface. Conceptual shape (Python/Pydantic):

```python
class ConnectorAdapter(Protocol):
    type: str                    # e.g., "aws-s3"
    access_mode: str             # "read_only" (default)

    def validate_config(self, config: dict) -> ValidationResult:
        """Validate non-secret config before activation."""

    def test_connection(self, ctx: ConnectorContext) -> HealthResult:
        """Verify credentials + reachability (read-only)."""

    def fetch(self, ctx: ConnectorContext, request: FetchRequest) -> Iterable[RawRecord]:
        """Pull raw records/artifacts read-only."""

    def normalize(self, raw: RawRecord) -> Event:
        """Map a provider record to a schema-validated PlatformTrust Event."""
```

- `ConnectorContext` provides the resolved tenant id, Key Vault-resolved credentials, and config from the [ConnectorAccount](./DOMAIN_MODEL.md).
- `normalize()` output **must be schema validated** against the event schema before it is persisted or used.
- Adapters must not perform any write/mutation calls against the provider.

## 4. Credential Handling

1. On configuration, secrets are stored in **Azure Key Vault**; the DB holds only `key_vault_ref`.
2. At runtime, the worker resolves the secret from Key Vault just-in-time into the `ConnectorContext`.
3. Secrets are never logged, never returned to the client, and never persisted in PostgreSQL or Blob.
4. Least-privilege: connectors are configured with the narrowest read scope that satisfies evidence needs.

## 5. Normalization to the Event Schema

- Each adapter maps provider fields to the envelope: `event_id`, `tenant_id`, `source_connector`, `event_type`, `occurred_at` (UTC), `ingested_at` (UTC), `payload`, `schema_version`.
- Provider timestamps are converted to **UTC**.
- The normalized `payload` conforms to the declared `schema_version` and is validated. See [Event Model](./EVENT_MODEL.md) for full rules.

## 6. Rate Limiting

- Adapters respect provider rate limits and back off on 429/throttling responses.
- Ingestion is scheduled/queued through the worker; a shared limiter caps concurrent calls per connector account.
- **Redis** may be used for distributed rate limiting **only when justified** — not a default dependency.

## 7. Error Handling

| Condition | Behavior |
|-----------|----------|
| Auth failure | Mark `ConnectorAccount.status = error`; surface to user; no retry storm. |
| Rate limited (429) | Exponential backoff and retry within limits. |
| Transient network error | Bounded retries with backoff. |
| Schema validation failure on `normalize()` | Reject the record, record the error; **do not** persist unvalidated data. |
| Partial fetch failure | Persist successfully normalized records; report the failed subset. |

Errors are observable and produce audit/log entries; they never silently drop evidence.

## 8. MVP Connectors

| Connector | Type key | Typical evidence / signals | Access |
|-----------|----------|----------------------------|--------|
| Generic REST | `generic-rest` | Arbitrary read-only REST endpoints returning JSON. | read-only |
| Webhook | `webhook` | Inbound normalized events pushed to PlatformTrust. | read-only (inbound) |
| AWS S3 | `aws-s3` | Object/bucket metadata and evidence artifacts. | read-only |
| Azure Blob | `azure-blob` | Container/blob metadata and evidence artifacts. | read-only |
| Salesforce | `salesforce` | Org/config/security-relevant metadata (initial connector). | read-only |
| SFTP | `sftp` | File listings and evidence documents. | read-only |

## 9. Adding a New Connector (future)

New connectors implement the §3 interface, isolate provider formats, normalize to the event schema, store secrets in Key Vault, and default to read-only. Expanding the catalog is **Phase 5** (see [Roadmap](../product/ROADMAP.md)) — not part of the MVP beyond the six connectors above.
