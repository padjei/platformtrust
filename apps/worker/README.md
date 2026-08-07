# PlatformTrust Worker Application

This directory contains asynchronous and scheduled PlatformTrust processing.

## Responsibilities

The worker handles:

- Background jobs.
- Scheduled jobs.
- Evidence collection.
- Connector synchronization.
- Notification delivery.
- Report generation.
- Document processing.
- Bulk imports and exports.
- Retryable integration work.
- Long-running compliance evaluations.
- Event consumption.

## Worker Requirements

Every job must define:

- Tenant context.
- Job type.
- Input schema.
- Idempotency strategy.
- Retry policy.
- Timeout.
- Failure behavior.
- Audit behavior.
- Logging and tracing behavior.
- Dead-letter handling where applicable.

## Reliability Rules

- Jobs must be safe to retry.
- Duplicate delivery must not corrupt state.
- Poison messages must not retry forever.
- Failures must be observable.
- Sensitive data must not be written to logs.
- Tenant context must never be inferred from untrusted payload data alone.
- Long-running work must report progress where appropriate.

## Planned Structure

```text
src/
├── jobs/
├── consumers/
├── schedules/
├── queues/
├── retry/
├── telemetry/
└── main.*
