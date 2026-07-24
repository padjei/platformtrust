# Architecture Rules

AI PlatformTrust is a **modular monolith**: one deployable, internally split into
modules with explicit boundaries. Keep modules cohesive and dependencies one-directional.

## Module boundaries
- **Do** organize by domain module (e.g. `readiness`, `connectors`, `monitoring`,
  `remediation`, `tenancy`, `audit`, `identity`). Each module owns its models,
  services, schemas, and routers.
- **Do** expose a module's capabilities through a thin service/interface layer.
  Cross-module calls go through that layer, never by reaching into another
  module's ORM models or private helpers.
- **Do** keep shared primitives (config, db session, auth context, event schema)
  in a small `core`/`shared` package that modules depend on — never the reverse.
- **Don't** create circular dependencies between modules. If two modules need each
  other, extract the shared concept into `core` or an event.
- **Don't** let the HTTP layer contain business logic. Routers validate, delegate
  to services, and serialize responses.

## Identifiers, time, and data hygiene
- **Do** use UUIDs (v4) for all primary keys and external references. Generate
  server-side.
- **Don't** expose sequential integer IDs or leak internal row counts.
- **Do** store and compute all timestamps in **UTC** (`timezone-aware datetimes`).
  Convert to local time only at the presentation edge.
- **Don't** persist naive datetimes or rely on the DB server's local timezone.

## Event normalization
- **Do** normalize every external/provider event into the canonical
  **PlatformTrust event schema** before it enters domain logic or storage.
- **Do** keep provider-specific parsing inside connector adapters (see
  `connectors.md`). Domain code only ever sees normalized events.
- **Don't** branch domain logic on provider-specific fields or raw payload shapes.

## Deterministic scoring
- **Do** make readiness scoring **deterministic and reproducible**: same inputs →
  same score, every time. Version scoring rules explicitly.
- **Do** keep scoring logic pure and unit-testable, separate from I/O.
- **Don't** let an LLM compute or adjust a score, or decide pass/fail. LLMs may
  only explain or summarize (see `ai-safety.md`).
- **Don't** introduce randomness, wall-clock, or ordering-dependent behavior into
  scoring.

## Cloud/app/model neutrality
- **Do** keep the platform cloud-neutral, application-neutral, and model-neutral.
  Salesforce and every other integration is a **connector, not a dependency**.
- **Don't** hardcode a specific provider, cloud, or model into core domain logic.
