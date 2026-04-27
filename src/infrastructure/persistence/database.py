from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from src.infrastructure.persistence.config import get_database_settings

# Retrieve database settings
db_settings = get_database_settings()

# Create an asynchronous engine
engine = create_async_engine(db_settings.DATABASE_URL, echo=False, future=True)

# Create a sessionmaker for asynchronous sessions
AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db_session() -> AsyncSession:
    """
    Dependency that provides an asynchronous database session.

    Yields:
        AsyncSession: An asynchronous SQLAlchemy session.
    """
    async with AsyncSessionLocal() as session:
        yield session
