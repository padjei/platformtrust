# PlatformTrust AI Service

A standalone [FastAPI](https://fastapi.tiangolo.com/) service (Python 3.12,
managed with [uv](https://docs.astral.sh/uv/)) that hosts PlatformTrust's
AI-specific capabilities as a separate process.

This is the initial scaffold delivered under **PT-001 / FR-008**. It is
deliberately minimal and model-neutral: it exposes only a health endpoint and
carries **no** model-provider SDKs, embeddings, vector database, AI prompts, or
database access. Those are added in later issues.

## Requirements

- Python 3.12 (see `.python-version`)
- [uv](https://docs.astral.sh/uv/) installed globally

This service is independent of the TypeScript workspace and has its own
`pyproject.toml` and `uv.lock`.

## Setup

```bash
cd apps/ai-service
uv sync            # install runtime + dev dependencies from uv.lock
```

## Configuration

Configuration is read from environment variables (non-secret only). All values
are validated at startup and the service fails fast on invalid input.

| Variable            | Values                                        | Default |
| ------------------- | --------------------------------------------- | ------- |
| `PLATFORMTRUST_ENV` | `local` \| `dev` \| `staging` \| `production` | `local` |
| `AI_SERVICE_PORT`   | integer `1`–`65535`                           | `8000`  |
| `LOG_LEVEL`         | `debug` \| `info` \| `warn` \| `error`        | `info`  |

Logs are emitted as structured JSON to stdout. No secrets, host details, or
internal configuration are logged or exposed by any endpoint.

## Run

```bash
cd apps/ai-service
uv run uvicorn platformtrust_ai_service.main:app --host 0.0.0.0 --port 8000
```

For local auto-reload during development:

```bash
uv run uvicorn platformtrust_ai_service.main:app --reload --port 8000
```

## Health endpoint

```
GET /api/v1/health
```

Returns `200 OK` with the following JSON shape (the `timestamp` is dynamic,
ISO-8601 UTC):

```json
{
  "status": "ok",
  "service": "platformtrust-ai-service",
  "version": "0.1.0",
  "timestamp": "2026-01-01T00:00:00+00:00"
}
```

## Test & quality gates

```bash
cd apps/ai-service
uv run ruff check .            # lint
uv run ruff format --check .   # formatting
uv run mypy .                  # static types (strict)
uv run pytest                  # tests
```
