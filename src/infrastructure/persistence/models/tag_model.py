"""
SQLAlchemy ORM model for the Tag entity.
"""

import datetime
import uuid

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.infrastructure.persistence.models import Base


class TagModel(Base):
    """
    Represents a Tag in the database.

    Attributes:
        id (UUID): Primary key, unique identifier for the tag.
        name (str): The name of the tag, must be unique.
        description (str | None): An optional description for the tag.
        created_at (datetime.datetime): Timestamp when the tag was created.
        updated_at (datetime.datetime): Timestamp when the tag was last updated.
    """

    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.datetime.now
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.datetime.now,
        onupdate=datetime.datetime.now,
    )

    def __repr__(self) -> str:
        return (
            f"<TagModel(id={self.id}, name='{self.name}', "
            f"description='{self.description}')>"
        )

