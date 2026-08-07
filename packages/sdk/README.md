# @platformtrust/sdk

Boundary package for the typed PlatformTrust API client.

## IMPORTANT: configuration types only — no API operations

> This package currently exposes **initial client configuration types only**.
> There are no generated API operations, resource methods, HTTP calls, or
> authentication logic yet.

It reserves the SDK boundary and gives consumers (the web app, internal tools)
a stable configuration contract to build against. Generated operations and
resource clients will be added in a later issue.

## Exported contracts

- `PlatformTrustClientConfig` — initial client configuration shape (`baseUrl`,
  optional `timeoutMs`, optional `authToken`, optional `defaultHeaders`).
  Constructing this value does nothing on its own.
- `DEFAULT_TIMEOUT_MS` — suggested default request timeout (30000 ms).

## SDK rules (carried forward)

- The SDK must follow documented API contracts and must **not** bypass API
  authorization — the server enforces authz and tenant scope.
- Never embed privileged tokens or cloud credentials in a browser bundle; auth
  tokens are sensitive and must never be logged.
- Breaking SDK changes require semantic versioning; generated code must not be
  hand-edited without a documented exception.

## Boundary / what does NOT belong here

- No HTTP client, retries, pagination, or webhook verification yet.
- No generated API operations or resource clients.
- No credentials or secrets committed to source.

## Testing

No runtime behavior exists yet, so this package has no tests; `test` and
`test:coverage` are intentional no-ops.
