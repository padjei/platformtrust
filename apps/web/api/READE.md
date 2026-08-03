# PlatformTrust API Application

This directory contains the primary PlatformTrust backend API.

## Responsibilities

The API application is responsible for:

- Authentication integration.
- Authorization enforcement.
- Tenant context validation.
- Domain operations.
- REST API endpoints.
- Request validation.
- Transaction coordination.
- Audit event creation.
- Integration orchestration.
- API observability.
- Secure access to PlatformTrust data.

## Architectural Boundaries

The API must not:

- Trust tenant identifiers from the client without validation.
- Place authorization logic exclusively in controllers or frontend code.
- Expose database records directly without an API contract.
- execute long-running work synchronously when it belongs in the worker.
- Contain AI model-provider logic that belongs in the AI service.
- Store secrets in source code.

## Planned Structure

```text
src/
├── modules/
├── common/
├── config/
├── middleware/
├── security/
├── telemetry/
└── main.*
