# Domain Model — AI PlatformTrust

> **Related docs:** [System Architecture](./SYSTEM_ARCHITECTURE.md) · [Multi-Tenancy](./MULTI_TENANCY.md) · [Trust Graph](./TRUST_GRAPH.md) · [Event Model](./EVENT_MODEL.md) · [Connector Framework](./CONNECTOR_FRAMEWORK.md) · [PRD](../product/PRD.md)

## Conventions (apply to all entities)

- **UUID primary keys** for every entity.
- **`tenant_id`** on every **tenant-owned** entity (all except `Tenant` itself). Enforced by API + PostgreSQL RLS — see [Multi-Tenancy](./MULTI_TENANCY.md).
- **UTC** for all timestamps (`created_at`, `updated_at`, and any `*_at`).
- All schema changes via **Alembic migrations**.
- The client-supplied tenant id is **never trusted**; `tenant_id` is derived from the server-side session.

## Entity Overview

| Entity | Tenant-owned | Purpose |
|--------|:---:|---------|
| Tenant | — | The isolation boundary; a customer organization. |
| User | ✓ | A person within a tenant. |
| Assessment | ✓ | A readiness assessment instance. |
| ReadinessDomain | ✓ | A domain within an assessment (Data, Security, Governance, Infrastructure, Operations). |
| Control | ✓ | A discrete readiness check within a domain. |
| ControlResult | ✓ | The deterministic outcome of evaluating a control. |
| Evidence | ✓ | An artifact supporting a control result. |
| Finding | ✓ | A gap derived from a failed/partial control. |
| RemediationItem | ✓ | A prioritized action to close a finding. |
| Connector | ✓ | A configured connector type for a tenant. |
| ConnectorAccount | ✓ | Credentials/config for a specific connector instance. |
| Event | ✓ | A normalized PlatformTrust event. |
| AuditEvent | ✓ | An immutable record of a significant action. |

## Entities

### Tenant
The isolation boundary. Not tenant-owned (it *is* the tenant).

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | string | |
| status | enum | active, suspended |
| created_at / updated_at | timestamp (UTC) | |

### User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| email | string | unique per tenant |
| role | enum | e.g., admin, contributor, viewer |
| created_at / updated_at | timestamp (UTC) | |

### Assessment
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| name | string | |
| status | enum | draft, running, scored, completed |
| overall_score | numeric | deterministic roll-up; nullable until scored |
| scoring_version | string | version of the scoring algorithm |
| created_by | UUID | FK → User |
| created_at / updated_at | timestamp (UTC) | |

### ReadinessDomain
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| assessment_id | UUID | FK → Assessment |
| key | enum | data, security, governance, infrastructure, operations |
| domain_score | numeric | deterministic; nullable until scored |
| created_at / updated_at | timestamp (UTC) | |

### Control
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| domain_id | UUID | FK → ReadinessDomain |
| code | string | stable control identifier |
| title | string | |
| description | text | |
| weight | numeric | contribution to domain score |
| created_at / updated_at | timestamp (UTC) | |

### ControlResult
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| control_id | UUID | FK → Control |
| status | enum | pass, fail, partial, not_applicable |
| rationale | text | deterministic explanation (not LLM-derived for the status) |
| evaluated_at | timestamp (UTC) | |

> The `status` is set **deterministically**. LLM output never sets it.

### Evidence
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| control_id | UUID | FK → Control (nullable if pending link) |
| blob_uri | string | Azure Blob location of the artifact |
| content_type | string | |
| checksum | string | integrity |
| source | enum | manual_upload, connector |
| connector_account_id | UUID | FK → ConnectorAccount (nullable) |
| created_at | timestamp (UTC) | evidence is immutable; new versions = new rows |

### Finding
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| control_result_id | UUID | FK → ControlResult |
| severity | enum | low, medium, high, critical (deterministic) |
| title | string | |
| business_impact | text | AI-**drafted**, schema-validated; explanatory only |
| created_at / updated_at | timestamp (UTC) | |

### RemediationItem
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| finding_id | UUID | FK → Finding |
| priority | enum | deterministic ordering |
| effort_estimate | enum | e.g., S, M, L |
| status | enum | open, in_progress, done |
| description | text | |
| created_at / updated_at | timestamp (UTC) | |

### Connector
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| type | enum | generic-rest, webhook, aws-s3, azure-blob, salesforce, sftp |
| access_mode | enum | read_only (default) |
| created_at / updated_at | timestamp (UTC) | |

### ConnectorAccount
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| connector_id | UUID | FK → Connector |
| name | string | |
| key_vault_ref | string | reference to secret in Azure Key Vault (never the secret itself) |
| config | jsonb | non-secret config |
| status | enum | active, error, disabled |
| created_at / updated_at | timestamp (UTC) | |

### Event
Normalized PlatformTrust event — see [Event Model](./EVENT_MODEL.md).

| Field | Type | Notes |
|-------|------|-------|
| event_id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| source_connector | string | originating connector type |
| event_type | string | normalized type |
| occurred_at | timestamp (UTC) | when it happened at source |
| ingested_at | timestamp (UTC) | when PlatformTrust received it |
| payload | jsonb | normalized, schema-validated |
| schema_version | string | |

### AuditEvent
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK → Tenant |
| actor_id | UUID | FK → User (nullable for system) |
| action | string | e.g., assessment.created, control.evaluated |
| target_type / target_id | string / UUID | affected entity |
| occurred_at | timestamp (UTC) | immutable |

## Relationships

```
Tenant 1──* User
Tenant 1──* Assessment 1──* ReadinessDomain 1──* Control 1──* ControlResult
Control 1──* Evidence
ControlResult 1──* Finding 1──* RemediationItem
Tenant 1──* Connector 1──* ConnectorAccount 1──* Evidence (source=connector)
ConnectorAccount 1──* Event
Tenant 1──* Event
Tenant 1──* AuditEvent
```

## Scoring Roll-Up (deterministic)

`ControlResult.status` (weighted by `Control.weight`) → `ReadinessDomain.domain_score` → `Assessment.overall_score`. The algorithm is versioned (`scoring_version`) and reproducible. LLM output never influences scores — see [MVP Scope](../product/MVP_SCOPE.md) §3.6.
