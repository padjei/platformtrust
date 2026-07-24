# docker

Dockerfiles for building AI PlatformTrust container images.

- `api.Dockerfile` — builds `services/api` (FastAPI on `python:3.12-slim`, served by uvicorn).
- `web.Dockerfile` — builds `apps/web` (Next.js on `node:20-alpine`).

Build from the repo root, e.g.:

```bash
docker build -f infrastructure/docker/api.Dockerfile -t platformtrust-api .
docker build -f infrastructure/docker/web.Dockerfile -t platformtrust-web .
```
