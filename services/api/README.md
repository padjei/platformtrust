# platformtrust-api

FastAPI backend for AI PlatformTrust, structured as a modular monolith.

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
```

## Running

```bash
uvicorn app.main:app --reload    # http://localhost:8000
```

Health check: `GET /health` -> `{"status": "ok"}`.

## Migrations (Alembic)

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

Rules:

- Every schema change requires a migration. Never edit a committed migration.
- Every tenant-owned table has a `tenant_id` (UUID) column and Row-Level Security (RLS).
- All timestamps are UTC. All primary keys are UUIDs.

## Quality

```bash
ruff check .
mypy app
pytest
```
