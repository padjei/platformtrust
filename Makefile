## AI PlatformTrust - developer task runner
##
## Backend lives in services/api (Python, FastAPI, uv).
## Frontend lives in apps/web (Next.js, npm).

API_DIR := services/api
WEB_DIR := apps/web

# Prefer uv if available; fall back to python -m for portability.
UV := $(shell command -v uv 2>/dev/null)
ifeq ($(UV),)
	PY_RUN := python -m
	PY_INSTALL := python -m pip install -e ".[dev]"
else
	PY_RUN := uv run
	PY_INSTALL := uv sync --all-extras
endif

.DEFAULT_GOAL := help
.PHONY: help setup dev down lint typecheck test test-integration test-e2e \
	security-check verify migrate

help: ## Show this help
	@echo "AI PlatformTrust - available make targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

setup: ## Install backend and frontend dependencies
	@echo ">> Installing backend dependencies ($(API_DIR))"
	cd $(API_DIR) && $(PY_INSTALL)
	@echo ">> Installing frontend dependencies ($(WEB_DIR))"
	cd $(WEB_DIR) && npm install
	@test -f .env || (cp .env.example .env && echo ">> Created .env from .env.example")

dev: ## Bring up the full stack (postgres, api, web) via docker compose
	docker compose up --build

down: ## Stop the docker compose stack
	docker compose down

migrate: ## Apply database migrations (Alembic)
	cd $(API_DIR) && $(PY_RUN) alembic upgrade head

lint: ## Lint backend (Ruff) and frontend (ESLint)
	cd $(API_DIR) && $(PY_RUN) ruff check .
	cd $(WEB_DIR) && npm run lint

typecheck: ## Type-check backend (mypy) and frontend (tsc)
	cd $(API_DIR) && $(PY_RUN) mypy .
	cd $(WEB_DIR) && npm run typecheck

test: ## Run unit tests (pytest + web unit tests)
	cd $(API_DIR) && $(PY_RUN) pytest -m "not integration"
	cd $(WEB_DIR) && npm test

test-integration: ## Run backend integration tests (Testcontainers)
	cd $(API_DIR) && $(PY_RUN) pytest -m integration

test-e2e: ## Run end-to-end tests (Playwright)
	cd $(WEB_DIR) && npm run test:e2e

security-check: ## Run dependency and secret scanning
	cd $(API_DIR) && $(PY_RUN) pip-audit || true
	cd $(WEB_DIR) && npm audit --audit-level=high || true

verify: lint typecheck test security-check ## Run lint, typecheck, test, and security-check
	@echo ">> verify complete"
