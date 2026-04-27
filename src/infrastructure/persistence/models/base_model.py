from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, MetaData


class BaseModel(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.

    Provides common fields like 'id', 'created_at', and 'updated_at'.
    """

    __abstract__ = True
    metadata = MetaData()

    id: Mapped[UUID] = mapped_column(
        primary_key=True, default=uuid4, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        default=func.now(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self) -> str:
        """
        Return a string representation of the model instance.
        """
        return (
            f"<{self.__class__.__name__}(id={self.id}, "
            f"created_at={self.created_at}, "
            f"updated_at={self.updated_at})>"
        )
