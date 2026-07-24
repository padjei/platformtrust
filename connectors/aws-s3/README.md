# aws-s3 connector

Connector for reading evidence/objects from Amazon S3 buckets.

- **Provider:** AWS S3.
- **Data types:** objects/files (documents, logs, exports) and object metadata.
- **Auth:** IAM access key/secret or assumed role; credentials fetched from Key Vault per tenant.
- **Read-only by default:** uses read-only S3 operations (ListObjects, GetObject); no writes/deletes.
- **Normalization:** each object (or manifest entry) becomes a PlatformTrust event with metadata
  in `payload` and `occurred_at` derived from the object's last-modified timestamp (UTC).
