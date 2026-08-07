# PlatformTrust SDK

This package provides supported client libraries for consuming PlatformTrust
APIs.

## Intended Consumers

- PlatformTrust web applications.
- PlatformTrust administrative tools.
- Approved internal services.
- Customer integrations.
- Partner integrations.
- Automation scripts.

## SDK Responsibilities

- Typed API clients.
- Authentication support.
- Request and response types.
- Pagination helpers.
- Retry support for safe operations.
- Error normalization.
- Correlation identifier support.
- Webhook verification utilities where applicable.

## SDK Rules

- The SDK must follow documented API contracts.
- The SDK must not bypass API authorization.
- Breaking SDK changes require semantic versioning.
- Generated code must not be manually edited without a documented exception.
- SDK errors must preserve actionable server error details without leaking
  sensitive information.

## Planned Structure

```text
src/
├── client/
├── resources/
├── types/
├── errors/
├── pagination/
├── webhooks/
└── generated/
