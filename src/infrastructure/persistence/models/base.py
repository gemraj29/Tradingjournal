from sqlalchemy import Column, DateTime
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    """
    Modern SQLAlchemy declarative base using the DeclarativeBase class.
    """

    pass


class TimestampMixin:
    """
    Mixin for adding created_at and updated_at columns to models.
    """

    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
