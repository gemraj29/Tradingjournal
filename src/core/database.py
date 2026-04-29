"""Async SQLAlchemy engine and session factory."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Import Base from the infrastructure layer to ensure a single declarative base
from .config import settings

engine = create_async_engine(
    settings.database_url, echo=False, pool_size=10, max_overflow=20
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


# The Base class is now imported from src.infrastructure.persistence.models
# and should not be redefined here.
# class Base(DeclarativeBase):
#     pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
