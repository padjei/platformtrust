# platformtrust-worker

Background worker for AI PlatformTrust. Handles asynchronous jobs such as:

- Evidence processing (parsing, hashing, storage in Blob Storage).
- Connector polling (read-only pulls) and normalization into the PlatformTrust event schema.
- Deterministic scoring runs triggered after evidence ingestion.

MVP: minimal stub. Job scheduling/queue integration is added later.
