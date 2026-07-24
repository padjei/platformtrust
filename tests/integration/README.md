# integration tests

Cross-module integration tests exercising the API, database, and connectors together.

- Uses **Testcontainers + PostgreSQL** to run against a real database.
- Verifies module boundaries, migrations/RLS, and end-to-end data flow (connector -> event
  schema -> scoring) work together.
