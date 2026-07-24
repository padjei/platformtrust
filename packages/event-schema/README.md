# event-schema

The normalized **PlatformTrust event schema**. Every connector normalizes external provider data
into this common envelope so the rest of the platform is provider-agnostic.

## Envelope

| Field            | Type              | Notes                                              |
| ---------------- | ----------------- | -------------------------------------------------- |
| `event_id`       | UUID              | Unique event identifier.                           |
| `tenant_id`      | UUID              | Owning tenant. Required on every event.            |
| `source`         | string            | Connector/provider that produced the event.        |
| `event_type`     | string            | Normalized event type.                             |
| `occurred_at`    | string (UTC ISO)  | When the event happened at the source.             |
| `ingested_at`    | string (UTC ISO)  | When PlatformTrust ingested it.                    |
| `payload`        | object            | Normalized, provider-specific event data.          |
| `schema_version` | string            | Version of this envelope schema.                   |

The JSON Schema lives in `schema/event.schema.json`.
