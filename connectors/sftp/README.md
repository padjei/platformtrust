# sftp connector

Connector for reading files from an SFTP server.

- **Provider:** any SSH/SFTP-accessible file server.
- **Data types:** files (documents, CSV/JSON exports, logs) and file metadata.
- **Auth:** SSH key or username/password; credentials fetched from Key Vault per tenant.
- **Read-only by default:** lists and downloads files only; never uploads, moves, or deletes.
- **Normalization:** each downloaded file becomes a PlatformTrust event with file metadata in
  `payload` and `occurred_at` from the file's modification time (UTC).
