# Observability Standard

> PlatformTrust engineering standard (PT-002 §8). This standard translates the
> constitutional and handbook observability requirements into reviewable
> engineering expectations. When it appears to conflict with a higher source,
> follow the precedence order in [the standards README](./README.md#precedence)
> and surface the conflict.

## 1. Purpose

This standard defines the observability expectations for every PlatformTrust
service so that system behavior can be understood, correlated, and operated
without exposing secrets or sensitive customer data. It operationalizes
[Constitution Article XVII (Observability)](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvii--everything-must-be-observable),
[Article XVIII (Reliability)](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xviii--reliability-is-a-product-feature),
and [Article XXIII (Domain Ownership)](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xxiii--domain-ownership-must-be-clear),
and it operationalizes [Handbook §25 (Observability)](../handbook/ENGINEERING_HANDBOOK.md#25-observability).

## 2. Scope

This standard applies to all runtime services and background processing:

- `apps/api` (NestJS API).
- `apps/worker` (NestJS standalone worker).
- `apps/ai-service` (FastAPI, Python 3.12).
- `apps/web` (Next.js).

It covers logs, metrics, traces, health/readiness signals, correlation-identifier
propagation, error aggregation, business-level telemetry, alert ownership, service
ownership, and the process for introducing service-level objectives.

This standard is provider-neutral. It does **not** select an observability vendor,
metrics/tracing backend, alerting platform, or dashboarding tool; those choices
are deferred to a future ADR (see [ADR-0002](../adr/ADR-0002-initial-application-technology-stack.md)).
It also does **not** define specific production SLO or SLI target values; §3.9
defines the process for introducing them.

## 3. Mandatory requirements

### 3.1 Logs

- Every service MUST emit structured logs in accordance with the
  [Logging Standard](./LOGGING_STANDARD.md).
- Logs MUST NOT expose secrets or sensitive customer data
  ([Article XVII](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvii--everything-must-be-observable)).

### 3.2 Metrics

- Each service SHOULD emit metrics covering request/operation throughput, error
  rate, and latency, plus resource-level signals where applicable.
- Metric names and labels MUST be consistent and MUST NOT encode secrets,
  free-form personal data, or unbounded-cardinality identifiers.
- The specific metrics client and backend are deferred to a future ADR; code
  SHOULD isolate metric emission behind a thin internal abstraction so the
  backend can be selected later without broad changes.

### 3.3 Traces

- Services SHOULD support distributed tracing across the API, worker, and AI
  service so a single logical operation can be followed end to end.
- Trace context MUST carry the correlation identifiers described in §3.5 and MUST
  NOT carry sensitive customer data in span names or attributes.
- The tracing implementation and backend are deferred to a future ADR.

### 3.4 Health and readiness

- Every service MUST expose the health/readiness signals already established in
  PT-001:
  - `apps/web`: `GET /health`.
  - `apps/api`: `GET /api/v1/health` (response includes `requestId`).
  - `apps/ai-service`: `GET /api/v1/health`.
  - `apps/worker`: internal health-state function (no inbound HTTP surface).
- Health responses MUST NOT expose secrets, credentials, internal hostnames, or
  sensitive configuration.
- New services MUST provide equivalent health and readiness signals, consistent
  with [Handbook §25](../handbook/ENGINEERING_HANDBOOK.md#25-observability).

### 3.5 Correlation identifiers

- The API MUST originate or accept a `requestId` per request and a
  `correlationId` for a logical flow, building on the request/correlation-ID
  middleware from PT-001.
- `requestId`, `correlationId`, and `traceId` (where present) MUST be propagated
  across service boundaries (API → worker → AI service) and across async/job
  boundaries, and MUST appear on the corresponding logs.
- Downstream services MUST reuse an inbound `correlationId` rather than minting a
  new one, so a flow remains joinable end to end.

### 3.6 Error aggregation

- Services MUST surface unhandled and significant handled errors to an error
  aggregation mechanism (backend deferred to a future ADR) with enough context
  (service, operation, correlation identifiers, error code) to triage them.
- Error payloads sent to aggregation MUST be scrubbed of prohibited data per the
  [Logging Standard §4](./LOGGING_STANDARD.md#4-prohibited-practices).
- Public error responses MUST follow [Handbook §24 (Error Handling)](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling)
  and MUST NOT leak stack traces, queries, internal hostnames, or secrets.

### 3.7 Business-level telemetry

- Critical workflows MUST have business-level telemetry, not only infrastructure
  metrics, consistent with [Handbook §25](../handbook/ENGINEERING_HANDBOOK.md#25-observability).
  Examples include evidence-collection success rate, audit-workflow completion,
  AI-recommendation failure rate, integration-synchronization failures,
  authorization-denial rate, and tenant-provisioning duration.
- Business telemetry MUST be privacy-safe: it MUST aggregate rather than expose
  individual sensitive records, and MUST follow
  [Constitution Article VI (Privacy and Data Minimization)](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-vi--privacy-and-data-minimization).
- Business telemetry MUST NOT be used as, or substituted for, the durable audit
  trail required by [Article II](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-ii--every-significant-action-must-be-auditable).

### 3.8 Alert and service ownership

- Every alert MUST have a defined owner and a documented response expectation; an
  alert with no owner MUST NOT be created.
- Alerts SHOULD be actionable and tied to a business or reliability signal;
  non-actionable, chronically firing alerts MUST be fixed or removed.
- Every production service MUST have a documented owner and the ownership
  attributes required by
  [Handbook §44 (Service Ownership)](../handbook/ENGINEERING_HANDBOOK.md#44-service-ownership)
  (owner, repository location, purpose, dependencies, data classification,
  escalation, dashboards, alerts, runbook, recovery expectations, deployment
  process). Unowned production services are prohibited
  ([Constitution Article XXIII](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xxiii--domain-ownership-must-be-clear)).

### 3.9 SLO/SLI introduction process

This standard does **not** define production SLO or SLI target values. Instead,
introducing an SLO/SLI MUST follow this process:

1. Identify the user-facing or reliability outcome to protect and the owning
   service/team ([Article XXIII](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xxiii--domain-ownership-must-be-clear)).
2. Define candidate SLIs (measurable signals) that are already, or can be, emitted
   under this standard.
3. Establish a measurement baseline from real telemetry before proposing any
   target; targets MUST NOT be invented without supporting data.
4. Propose SLO targets and error budgets in a reviewed artifact (an ADR when the
   decision is architecturally significant per
   [Handbook §10](../handbook/ENGINEERING_HANDBOOK.md#10-architecture-decision-records)).
5. On approval, wire the SLIs to alerting with a defined owner (§3.8) and a
   runbook, and record the owning service.
6. Review SLOs periodically and revise targets through the same process; changes
   MUST NOT be made silently.

## 4. Prohibited practices

- Observability signals (logs, metrics, traces, health responses, error reports,
  telemetry, dashboards) MUST NOT expose secrets or sensitive customer data.
- Production services MUST NOT ship without health/readiness signals, structured
  logs, and a defined owner.
- Alerts MUST NOT be created without an owner and response expectation.
- Production SLO/SLI target values MUST NOT be invented or hardcoded outside the
  process in §3.9.
- Business telemetry MUST NOT record individual sensitive customer records where
  an aggregate suffices.
- An observability vendor, metrics/tracing/alerting/dashboarding backend MUST NOT
  be selected in code or configuration ahead of the deferred ADR.

## 5. Examples

Correlation-identifier propagation across a logical flow:

```text
Client → api (GET /api/v1/health returns requestId)
  api mints/accepts requestId + correlationId
    → worker job (inherits correlationId, traceId)
      → ai-service call (inherits correlationId, traceId)
All logs for the flow share the same correlationId and are joinable end to end.
```

Illustrative business-level telemetry (names only; targets and thresholds are set
through the §3.9 process, not here):

| Telemetry signal                    | Type    | Owner    |
| ----------------------------------- | ------- | -------- |
| `evidence.collection.success_rate`  | metric  | (owning team) |
| `ai.recommendation.failure_rate`    | metric  | (owning team) |
| `authz.denial_rate`                 | metric  | (owning team) |

## 6. Enforcement mechanisms

- **Pull request review:** Reviewers MUST verify that new or changed services
  expose health/readiness signals, propagate correlation identifiers, emit
  structured logs, and declare an owner before merge.
- **Service ownership check:** A production service MUST have a completed
  ownership record ([Handbook §44](../handbook/ENGINEERING_HANDBOOK.md#44-service-ownership))
  before release.
- **Tests:** Correlation-identifier propagation and health/readiness responses
  SHOULD be covered by integration tests; redaction of error payloads is covered
  under the [Logging Standard](./LOGGING_STANDARD.md).
- **Validation commands:** Changes MUST pass the repository validation flow via
  pnpm/uv (`pnpm lint`, `pnpm typecheck`, `pnpm test`; for `apps/ai-service`,
  `uv run ruff check .`, `uv run mypy .`, `uv run pytest`). Validation is not run
  via make.

An observability capability without corresponding enforcement is considered
incomplete.

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
- [Article XVIII — Reliability Is a Product Feature](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xviii--reliability-is-a-product-feature)
- [Article XXIII — Domain Ownership Must Be Clear](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xxiii--domain-ownership-must-be-clear)

## 9. Related Handbook sections

- [§23 — Logging Standards](../handbook/ENGINEERING_HANDBOOK.md#23-logging-standards)
- [§24 — Error Handling](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling)
- [§25 — Observability](../handbook/ENGINEERING_HANDBOOK.md#25-observability)
- [§26 — Background Jobs and Events](../handbook/ENGINEERING_HANDBOOK.md#26-background-jobs-and-events)
- [§44 — Service Ownership](../handbook/ENGINEERING_HANDBOOK.md#44-service-ownership)

## Related standards

- [Logging Standard](./LOGGING_STANDARD.md)
