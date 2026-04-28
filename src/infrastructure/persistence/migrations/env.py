import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

# Ensure the project root (where `src/` lives) is on sys.path so that
# `from src.infrastructure...` imports work regardless of where alembic
# is invoked from.
_project_root = Path(__file__).resolve().parents[4]
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.ext.asyncio import AsyncEngine

# Import all models for Alembic to discover
from src.infrastructure.persistence.models.base import Base  # noqa
from src.infrastructure.persistence.models.account_model import AccountModel  # noqa
from src.infrastructure.persistence.models.trade_model import TradeModel  # noqa
from src.infrastructure.persistence.models.tag_model import TagModel  # noqa
from src.infrastructure.persistence.models.trade_tag_model import TradeTagModel  # noqa

# this is the Alembic Config object, which provides
# access to values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an actual Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation we
    don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    """Run migrations in 'online' mode."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    connectable = config.attributes.get("connection", None)
    if connectable is None:
        # Get database URL from environment variable
        # This is the preferred way for Docker/production environments
        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
            # Fallback to alembic.ini if env var not set (e.g., local dev)
            db_url = config.get_main_option("sqlalchemy.url")

        if not db_url:
            raise ValueError("DATABASE_URL not set and no default in alembic.ini")

        connectable = AsyncEngine(
            engine_from_config(
                config.get_section(config.config_ini_section, {}),
                prefix="sqlalchemy.",
                poolclass=pool.NullPool,
                url=db_url,
            )
        )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
