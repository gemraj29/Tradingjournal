import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

# Ensure project root is on sys.path so `from src...` imports resolve
# regardless of where alembic is invoked from.
_project_root = Path(__file__).resolve().parents[4]
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from alembic import context  # noqa: E402
from sqlalchemy import pool  # noqa: E402
from sqlalchemy.ext.asyncio import create_async_engine  # noqa: E402

from src.infrastructure.persistence.models.account_model import (
    AccountModel as AccountModel,  # noqa: E402, F401
)
from src.infrastructure.persistence.models.base import Base as Base  # noqa: E402, F401
from src.infrastructure.persistence.models.tag_model import (
    TagModel as TagModel,  # noqa: E402, F401
)
from src.infrastructure.persistence.models.trade_model import (
    TradeModel as TradeModel,  # noqa: E402, F401
)
from src.infrastructure.persistence.models.trade_tag_model import (
    TradeTagModel as TradeTagModel,  # noqa: E402, F401
)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _get_url() -> str:
    """Resolve the database URL, preferring the DATABASE_URL env var."""
    url = os.environ.get("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
    if not url:
        raise ValueError(
            "DATABASE_URL env var not set and sqlalchemy.url not found in alembic.ini"
        )
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


def run_migrations_offline() -> None:
    """Run migrations without a live DB connection (generates SQL to stdout)."""
    url = _get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations against a live DB using an async engine."""
    connectable = config.attributes.get("connection", None)
    if connectable is None:
        url = _get_url()
        connectable = create_async_engine(url, poolclass=pool.NullPool)
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)
        await connectable.dispose()
    else:
        await connectable.run_sync(do_run_migrations)


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
