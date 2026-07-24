# generic-rest connector

Generic connector for pulling data from arbitrary REST/JSON APIs.

- **Provider:** any HTTP JSON API (configurable base URL, endpoints, pagination).
- **Data types:** JSON records returned by configured endpoints.
- **Auth:** API key / bearer token / basic auth; credentials fetched from Key Vault per tenant.
- **Read-only by default:** issues only GET requests unless explicitly configured otherwise.
- **Normalization:** maps configured response fields into the PlatformTrust event envelope
  (`event_id`, `tenant_id`, `source`, `event_type`, `occurred_at`, `payload`, ...).
