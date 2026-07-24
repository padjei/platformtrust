# salesforce connector

Connector for reading records from Salesforce.

> Note: Salesforce is an **initial connector** shipped with the MVP. It is NOT a platform
> dependency — the platform does not require Salesforce to function.

- **Provider:** Salesforce (REST / Bulk API).
- **Data types:** standard and custom objects (Accounts, Contacts, custom records), via SOQL.
- **Auth:** OAuth 2.0 (connected app); tokens/refresh tokens stored in Key Vault per tenant.
- **Read-only by default:** performs SOQL queries and reads only; no record mutations.
- **Normalization:** each queried record maps to a PlatformTrust event, with the object type as
  `event_type` and record fields in `payload`.
