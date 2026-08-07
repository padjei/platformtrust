"""Tests for the AI service health endpoint and configuration validation."""

from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from platformtrust_ai_service import __version__
from platformtrust_ai_service.config import Settings
from platformtrust_ai_service.main import create_app


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app(Settings()))


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "platformtrust-ai-service"
    assert body["version"] == "0.1.0"
    assert body["version"] == __version__


def test_health_timestamp_is_iso8601(client: TestClient) -> None:
    body = client.get("/api/v1/health").json()
    assert "timestamp" in body

    parsed = datetime.fromisoformat(body["timestamp"])
    assert parsed.tzinfo is not None


def test_health_does_not_expose_internal_config(client: TestClient) -> None:
    body = client.get("/api/v1/health").json()
    assert set(body.keys()) == {"status", "service", "version", "timestamp"}


def test_settings_reject_invalid_environment() -> None:
    with pytest.raises(ValidationError):
        Settings(PLATFORMTRUST_ENV="not-a-real-env")


def test_settings_reject_out_of_range_port() -> None:
    with pytest.raises(ValidationError):
        Settings(AI_SERVICE_PORT=70000)


def test_settings_accept_valid_values() -> None:
    settings = Settings(PLATFORMTRUST_ENV="production", AI_SERVICE_PORT=8080, LOG_LEVEL="warn")
    assert settings.platformtrust_env == "production"
    assert settings.ai_service_port == 8080
    assert settings.log_level == "warn"
