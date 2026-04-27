import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    """
    Configuration settings for the database connection.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://user:password@localhost:5432/tradingjournal_db",
    )


def get_database_settings() -> DatabaseSettings:
    """
    Provides the database settings.
    """
    return DatabaseSettings()
