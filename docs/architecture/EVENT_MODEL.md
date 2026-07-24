# Event Model — PlatformTrust Event Schema

> **Related docs:** [Connector Framework](./CONNECTOR_FRAMEWORK.md) · [Domain Model](./DOMAIN_MODEL.md) · [System Architecture](./SYSTEM_ARCHITECTURE.md) · [Multi-Tenancy](./MULTI_TENANCY.md) · [MVP Scope](../product/MVP_SCOPE.md)

## 1. Purpose

The **PlatformTrust event schema** is the single normalized representation of every external signal the platform ingests. Connectors translate provider-specific data into this schema so the core never depends on any provider's format (see [Connector Framework](./CONNECTOR_FRAMEWORK.md)). This normalization is what makes the platform **cloud-, application-, and model-neutral**.

> **All AI machine-readable output must be schema validated.** Any structured output produced by an LLM that the system will act on or persist is validated against its declared schema before use — and LLM output never determines control pass/fail, scores, authorization, or compliance status.

## 2. Envelope

Every event shares a common envelope:

| Field | Type | Required | Notes |
|-------|------|:--:|-------|
| `event_id` | UUID | ✓ | Unique per event; primary key. |
| `tenant_id` | UUID | ✓ | Owning tenant; set server-side, never from client. |
| `source_connector` | string | ✓ | Connector type that produced it (e.g., `aws-s3`). |
| `event_type` | string | ✓ | Normalized type (e.g., `storage.object.metadata`). |
| `occurred_at` | timestamp (UTC) | ✓ | When the event happened at the source. |
| `ingested_at` | timestamp (UTC) | ✓ | When PlatformTrust received/normalized it. |
| `payload` | object (JSON) | ✓ | Normalized, schema-validated body. |
| `schema_version` | string | ✓ | Version of the payload schema (e.g., `1.0`). |

Persisted as the [Event](./DOMAIN_MODEL.md) entity. Conventions: UUID PK, `tenant_id` on every row, UTC timestamps.

## 3. Example

```json
{
  "event_id": "6f1c2b3a-9d4e-4f21-8a77-2b6e0d1c9a55",
  "tenant_id": "b2a1f0e9-1234-4c56-9abc-0f1e2d3c4b5a",
  "source_connector": "aws-s3",
  "event_type": "storage.object.metadata",
  "occurred_at": "2026-07-23T14:05:00Z",
  "ingested_at": "2026-07-23T14:05:12Z",
  "schema_version": "1.0",
  "payload": {
    "bucket": "customer-exports",
    "object_count": 1284,
    "encryption": "aes256",
    "public_access_blocked": true
  }
}
```

## 4. Normalization Rules

1. **Adapter-owned mapping.** Only connector adapters map provider formats to this schema (see [Connector Framework](./CONNECTOR_FRAMEWORK.md) §5). The core never parses provider-native formats.
2. **UTC only.** `occurred_at` and `ingested_at` are stored in UTC; provider-local timestamps are converted.
3. **Stable `event_type` taxonomy.** Types use a `domain.object.action`-style convention and are versioned via `schema_version`.
4. **Deterministic.** Given the same raw input, normalization always yields the same event. No LLM in the normalization path.
5. **Tenant-stamped.** `tenant_id` is set from the resolved server-side tenant context, never from the payload or client (see [Multi-Tenancy](./MULTI_TENANCY.md)).
6. **Idempotency.** `event_id` is derived deterministically where possible so re-ingesting the same source record does not create duplicates.
7. **No secrets in payload.** Credentials and sensitive tokens are never placed in `payload`.

## 5. Schema Validation

- The `payload` is validated against the schema identified by `event_type` + `schema_version` **before** persistence or use.
- Validation failures are rejected and recorded as errors; unvalidated data is never persisted (see [Connector Framework](./CONNECTOR_FRAMEWORK.md) §7).
- The **same rule applies to AI machine-readable output**: any structured LLM output (e.g., a drafted business-impact object) is schema validated before it is stored or rendered. It remains explanatory only and never sets outcomes.

## 6. Versioning

- `schema_version` is bumped when a payload structure changes.
- Adapters declare the version they emit; consumers validate against it.
- Multiple versions may coexist during migration; readers select the validator by `schema_version`.

## 7. Relationship to Assessment

- Normalized events feed **deterministic** control evaluation and can be attached as/backing [Evidence](./DOMAIN_MODEL.md).
- Events also underpin the [Trust Graph](./TRUST_GRAPH.md) and, in future phases, continuous monitoring and drift detection (see [Roadmap](../product/ROADMAP.md)) — reusing the same schema.
