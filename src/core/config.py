"""Centralised settings loaded from environment variables."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    debug: bool = False
    secret_key: str = "change-me"
    database_url: str = "postgresql+asyncpg://app:secret@localhost:5432/appdb"
    redis_url: str = "redis://localhost:6379/0"
    allowed_origins: list[str] = Field(default=["http://localhost:3000"])


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
