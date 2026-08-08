# Logging Standard

> PlatformTrust engineering standard (PT-002 §7). This standard translates and
> operationalizes the constitutional and handbook logging requirements. When it
> appears to conflict with a higher source, follow the precedence order in
> [the standards README](./README.md#precedence) and surface the conflict.

## 1. Purpose

This standard defines how every PlatformTrust service produces application logs so
that system behavior is understandable and auditable without exposing secrets or
sensitive customer data. It exists to make [Constitution Article II
(Auditability)](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-ii--every-significant-action-must-be-auditable),
[Article VI (Privacy and Data Minimization)](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-vi--privacy-and-data-minimization),
and [Article XVII (Observability)](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvii--everything-must-be-observable)
concrete and reviewable, and it operationalizes [Handbook §23 (Logging
Standards)](../handbook/ENGINEERING_HANDBOOK.md#23-logging-standards).

This standard governs operational and diagnostic logging. It does **not** define
the durable audit trail, which is a separate concern governed by Article II;
audit events MUST NOT be replaced by logs.

## 2. Scope

This standard applies to all runtime application logging emitted by:

- `apps/api` (NestJS API).
- `apps/worker` (NestJS standalone worker).
- `apps/ai-service` (FastAPI, Python 3.12).
- `apps/web` (Next.js) server-side logging.
- Shared packages under `packages/` that emit logs.

It covers what MUST be logged, the required structure and fields, log levels, and
data that MUST NOT appear in logs. It does not select a logging library, log
transport, storage backend, or observability vendor; those choices are deferred
to a future ADR (see [ADR-0002](../adr/ADR-0002-initial-application-technology-stack.md)).

## 3. Mandatory requirements

### 3.1 Structure

- Logs MUST be emitted as structured, machine-parseable records (JSON in
  non-local environments). Free-text-only log lines MUST NOT be used for
  operational logging.
- Every log record MUST be a single self-describing event; a message string MUST
  NOT be the only carrier of contextual data that belongs in fields.
- Timestamps MUST be recorded in UTC using ISO 8601 with millisecond precision.
- Log field names MUST be consistent across services so records can be correlated
  and searched uniformly.

### 3.2 Recommended common fields

The following fields SHOULD be present on log records where applicable, using
these names:

| Field           | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `timestamp`     | Event time in UTC, ISO 8601.                                       |
| `severity`      | Log level (see §3.4).                                              |
| `service`       | Emitting service, e.g. `api`, `worker`, `ai-service`, `web`.       |
| `environment`   | Deployment environment identifier.                                 |
| `requestId`     | Per-request identifier (see [Observability Standard](./OBSERVABILITY_STANDARD.md)). |
| `correlationId` | Identifier joining work across services and async boundaries.      |
| `traceId`       | Distributed-trace identifier when tracing is present.              |
| `operation`     | Logical operation or handler name.                                 |
| `outcome`       | Result of the operation, e.g. `success`, `failure`, `denied`.      |
| `duration`      | Elapsed time of the operation in milliseconds, when measurable.    |
| `errorCode`     | Stable, non-sensitive error code when `outcome` is a failure.      |

- The API and worker MUST populate `requestId` and, where available,
  `correlationId` on request-scoped logs, building on the request/correlation-ID
  middleware and structured JSON logging established in PT-001.
- The AI service MUST propagate and log the inbound `correlationId`/`requestId`
  when present so cross-service flows remain traceable.

### 3.3 Tenant and user identifiers

- Tenant and user identifiers MAY be logged **only** when there is a justified
  operational or audit need and doing so is consistent with data minimization
  under [Constitution Article VI](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-vi--privacy-and-data-minimization).
- When logged, tenant/user identifiers MUST be opaque, non-sensitive identifiers
  (e.g. UUIDs), never names, email addresses, or other personal data used as
  identifiers.
- Logging a tenant or user identifier MUST NOT be used as a substitute for the
  audit trail.

### 3.4 Log levels

Every log call MUST use an appropriate level from the following set:

| Level   | When to use                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------- |
| `error` | An operation failed and requires attention; unhandled exceptions; failed critical dependencies. |
| `warn`  | A recoverable or degraded condition, retryable failure, or approaching-limit signal.            |
| `info`  | Notable normal lifecycle events: service start/stop, request outcomes, job start/completion.    |
| `debug` | Detailed diagnostic context useful during investigation; disabled by default in production.     |
| `trace` | Very fine-grained flow detail for local or deep debugging; MUST NOT be enabled in production.   |

- Default production log level SHOULD be `info` or higher for routine volume,
  with `debug`/`trace` reserved for scoped investigation.
- Errors that are caught and handled MUST still be logged with enough context to
  diagnose them; exceptions MUST NOT be silently swallowed.

### 3.5 Redaction

- Every service MUST apply redaction/scrubbing before log emission so that
  prohibited data (see §4) cannot reach a log sink even when it appears inside an
  object, error, or nested payload.
- New log call sites that include request bodies, connector payloads, headers, or
  error objects MUST be reviewed for prohibited data before merge.

## 4. Prohibited practices

Logs MUST NOT contain any of the following (per [Handbook §23](../handbook/ENGINEERING_HANDBOOK.md#23-logging-standards)
and [Constitution Article VI](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-vi--privacy-and-data-minimization)):

- Passwords or password hashes.
- Access tokens, refresh tokens, session tokens, or API secrets.
- Private keys or other key material.
- Full payment data.
- Sensitive document contents or evidence payloads.
- Unnecessary personal data.
- Raw AI prompts or completions containing sensitive customer information.

Additionally:

- Services MUST NOT log full request or connector payloads at `info` level.
- Public/client-facing error responses MUST NOT be produced by copying internal
  log detail; see [Handbook §24 (Error Handling)](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling).
- Logging MUST NOT be disabled to hide failures, and log levels MUST NOT be
  downgraded to suppress recurring errors.
- Data classified as sensitive under
  [Data Classification](../security/DATA_CLASSIFICATION.md) MUST NOT be logged
  outside an approved, protected exception.

## 5. Examples

A provider-neutral structured log record for a successful request:

```json
{
  "timestamp": "2026-08-08T14:32:10.482Z",
  "severity": "info",
  "service": "api",
  "environment": "staging",
  "requestId": "5f2b1c9a-1e4d-4c2a-9b77-8d0e2a6c1f33",
  "correlationId": "b7d3e0a2-9c11-4f6e-8a21-2c4d5e6f7a80",
  "traceId": "0af7651916cd43dd8448eb211c80319c",
  "operation": "assessments.create",
  "outcome": "success",
  "durationMs": 87,
  "tenantId": "9c8b7a6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d"
}
```

A handled failure, with a stable error code and no sensitive payload:

```json
{
  "timestamp": "2026-08-08T14:33:02.114Z",
  "severity": "error",
  "service": "worker",
  "environment": "staging",
  "correlationId": "b7d3e0a2-9c11-4f6e-8a21-2c4d5e6f7a80",
  "operation": "evidence.normalize",
  "outcome": "failure",
  "errorCode": "EVIDENCE_SCHEMA_INVALID",
  "durationMs": 42
}
```

## 6. Enforcement mechanisms

- **Static analysis and review:** ESLint/Prettier (TypeScript) and Ruff/mypy
  (Python) run in CI; log call sites are checked in code review for correct level
  use and absence of prohibited data.
- **Redaction tests:** Services that implement redaction MUST have unit tests
  asserting that prohibited fields are removed from representative payloads and
  error objects.
- **Pull request review:** Reviewers MUST verify structured fields, level
  correctness, and that no prohibited data (§4) is logged, consistent with the
  handbook Definition of Done.
- **Validation commands:** Changes MUST pass the repository validation flow
  (`pnpm lint`, `pnpm typecheck`, `pnpm test`, and for `apps/ai-service`
  `uv run ruff check .`, `uv run mypy .`, `uv run pytest`). Validation is run via
  pnpm/uv, not make.

A logging change without corresponding enforcement is considered incomplete.

## 7. Exception process

Any deviation from this standard requires an explicit, documented exception under
[Constitution §6 (Exception Process)](../constitution/PLATFORMTRUST_CONSTITUTION.md#6-exception-process).
Silent exceptions are prohibited. An exception request MUST include the affected
requirement, business and technical justification, security and privacy impact,
compensating controls, the exception owner, the approval authority, an expiration
date, and a remediation plan.

## 8. Related Constitution articles

- [Article II — Every Significant Action Must Be Auditable](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-ii--every-significant-action-must-be-auditable)
- [Article VI — Privacy and Data Minimization](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-vi--privacy-and-data-minimization)
- [Article XVII — Everything Must Be Observable](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvii--everything-must-be-observable)

## 9. Related Handbook sections

- [§23 — Logging Standards](../handbook/ENGINEERING_HANDBOOK.md#23-logging-standards)
- [§24 — Error Handling](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling)
- [§25 — Observability](../handbook/ENGINEERING_HANDBOOK.md#25-observability)
- [§22 — Secret Management](../handbook/ENGINEERING_HANDBOOK.md#22-secret-management)

## Related standards

- [Observability Standard](./OBSERVABILITY_STANDARD.md)
- [Data Classification](../security/DATA_CLASSIFICATION.md)
