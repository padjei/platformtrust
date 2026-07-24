# webhook connector

Inbound connector that receives events pushed by external systems via HTTP webhooks.

- **Provider:** any system capable of sending signed webhook callbacks.
- **Data types:** event payloads delivered on webhook POSTs.
- **Auth:** shared-secret HMAC signature verification; secrets stored in Key Vault per tenant.
- **Read-only by default:** ingests inbound data only; never calls back to mutate the source.
- **Normalization:** verifies the signature, then maps the payload into the PlatformTrust event
  envelope, tagging `source` and `tenant_id`.
