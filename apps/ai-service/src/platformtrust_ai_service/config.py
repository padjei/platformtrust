"""Application configuration for the PlatformTrust AI service.

Settings are loaded from environment variables (and an optional local ``.env``
file for development). Only non-secret runtime configuration is handled here.
Invalid values fail fast at startup via Pydantic validation.
"""

from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PlatformEnv = Literal["local", "dev", "staging", "production"]
LogLevel = Literal["debug", "info", "warn", "error"]


class Settings(BaseSettings):
    """Validated runtime settings for the AI service.

    Env vars:
        PLATFORMTRUST_ENV: deployment context (local | dev | staging | production).
        AI_SERVICE_PORT: TCP port the service binds to (1-65535).
        LOG_LEVEL: logging verbosity (debug | info | warn | error).
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    platformtrust_env: PlatformEnv = Field(default="local", alias="PLATFORMTRUST_ENV")
    ai_service_port: int = Field(default=8000, ge=1, le=65535, alias="AI_SERVICE_PORT")
    log_level: LogLevel = Field(default="info", alias="LOG_LEVEL")


def get_settings() -> Settings:
    """Construct settings from the environment, raising on invalid values."""
    return Settings()
