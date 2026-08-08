"""FastAPI application entrypoint for the PlatformTrust AI service.

Exposes a minimal, secret-free health endpoint. This service is model-neutral
and, at this stage, carries no AI provider SDKs, embeddings, vector stores, or
database access (see PT-001 FR-008).
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import FastAPI
from pydantic import BaseModel, Field

from . import __version__
from .config import Settings, get_settings
from .logging import configure_logging

SERVICE_NAME = "platformtrust-ai-service"

logger = logging.getLogger(SERVICE_NAME)


class HealthResponse(BaseModel):
    """Schema for the health check response."""

    status: str = Field(examples=["ok"])
    service: str = Field(examples=[SERVICE_NAME])
    version: str = Field(examples=[__version__])
    timestamp: str = Field(
        description="ISO-8601 UTC timestamp at which the response was generated.",
        examples=["2026-01-01T00:00:00+00:00"],
    )


def create_app(settings: Settings | None = None) -> FastAPI:
    """Application factory. Builds and configures the FastAPI app."""
    resolved = settings or get_settings()
    configure_logging(resolved.log_level)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        logger.info(
            "ai_service.startup",
            extra={
                "service": SERVICE_NAME,
                "version": __version__,
                "environment": resolved.platformtrust_env,
            },
        )
        yield
        logger.info("ai_service.shutdown", extra={"service": SERVICE_NAME})

    app = FastAPI(
        title="PlatformTrust AI Service",
        version=__version__,
        lifespan=lifespan,
    )

    @app.get("/api/v1/health", response_model=HealthResponse, tags=["system"])
    async def health() -> HealthResponse:
        """Liveness probe. Returns no secrets or internal configuration."""
        return HealthResponse(
            status="ok",
            service=SERVICE_NAME,
            version=__version__,
            timestamp=datetime.now(UTC).isoformat(),
        )

    return app


app = create_app()
