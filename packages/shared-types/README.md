# shared-types

Shared type definitions used across the web frontend and the API backend to keep contracts in sync.

- **TypeScript** types/Zod schemas consumed by `apps/web` and `packages/ui`.
- **Pydantic** models mirrored on the Python side (`services/api`, `services/worker`).

Keep the two representations aligned. Where practical, generate one from the other (e.g. TS types
from JSON Schema / OpenAPI) rather than hand-maintaining both.
