# azure-blob connector

Connector for reading evidence/objects from Azure Blob Storage.

- **Provider:** Azure Blob Storage.
- **Data types:** blobs (documents, logs, exports) and blob metadata.
- **Auth:** connection string / SAS token / managed identity; secrets fetched from Key Vault.
- **Read-only by default:** uses read-only operations (list containers/blobs, download); no writes.
- **Normalization:** each blob becomes a PlatformTrust event with metadata in `payload` and
  `occurred_at` derived from the blob's last-modified timestamp (UTC).
