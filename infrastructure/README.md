# infrastructure

Infrastructure-as-Code and operational tooling for AI PlatformTrust.

- `terraform/` — Azure infrastructure (Container Apps, PostgreSQL, Key Vault, Blob Storage).
- `docker/` — Dockerfiles for the API and web app.
- `scripts/` — operational and CI helper scripts.

No secrets, subscription IDs, or credentials are committed here. Secrets live in Azure Key Vault
and are injected at deploy/runtime.
