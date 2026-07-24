# security tests

Security-focused test suites:

- **Authorization:** RBAC enforcement; users cannot access resources outside their permissions.
- **Input validation:** malformed/hostile input is rejected (Pydantic/Zod boundaries).
- **Secret handling:** secrets are never logged or returned; credentials come from Key Vault.
- **Connector safety:** connectors stay read-only unless explicitly configured otherwise.
