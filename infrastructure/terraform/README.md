# terraform

Terraform configuration provisioning AI PlatformTrust on **Azure**:

- **Azure Container Apps** — runs the API, worker, and web app.
- **Azure Database for PostgreSQL** — primary datastore (with Row-Level Security in-app).
- **Azure Key Vault** — secrets and connector credentials.
- **Azure Blob Storage** — evidence and object storage.

## Usage

```bash
terraform init
terraform plan
terraform apply
```

Do not commit secrets, subscription IDs, or `*.tfvars` containing sensitive values. Use a remote
backend and CI-provided credentials.
