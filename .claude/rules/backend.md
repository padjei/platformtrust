# Backend Rules

Python + FastAPI + Pydantic + SQLAlchemy + Alembic. Typed, validated, and layered.

## Layering
- **Do** keep routers thin: parse/validate input, resolve auth + tenant context,
  call a service, serialize a response model.
- **Do** put business logic in service/domain modules; put persistence in
  repositories/data-access using SQLAlchemy.
- **Don't** run raw business logic or ad-hoc queries inside route handlers.

## Validation and typing
- **Do** define explicit Pydantic request and response models for every endpoint.
- **Do** validate and coerce all inputs at the boundary; reject unknown/extra
  fields where appropriate.
- **Do** fully type function signatures; keep `mypy` clean and `ruff` clean.
- **Don't** use `Any`, untyped dicts as DTOs, `# type: ignore`, or `# noqa` to
  paper over real type/lint problems.

## Error handling and logging
- **Do** raise typed/domain exceptions and map them to HTTP responses centrally.
- **Do** log errors with structured context (tenant, resource, request id) at the
  right level — but never log secrets or PII.
- **Don't** swallow exceptions silently or return 200 on failure.
- **Don't** leak internal stack traces or SQL to API clients.

## Tenancy and security
- **Do** derive `tenant_id` from the authenticated context and pass it through the
  service layer; set DB session tenant context for RLS.
- **Don't** accept `tenant_id` from the request body/query/header.

## Dependencies
- **Do** justify each new dependency (need, maintenance, license, security). Prefer
  the standard library and existing stack.
- **Do** add Redis or other infra only when a concrete need justifies it.
- **Don't** add heavy or unmaintained libraries for trivial functionality.

## Async and resources
- **Do** use async I/O consistently and manage DB sessions/transactions with clear
  scope (one unit of work per request).
- **Don't** block the event loop with sync I/O or leak sessions/connections.
