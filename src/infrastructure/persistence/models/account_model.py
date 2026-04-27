"""
SQLAlchemy ORM model for the Account entity.
"""

import datetime
import uuid

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.infrastructure.persistence.models import Base


class AccountModel(Base):
    """
    Represents a trading account in the database.

    Attributes:
        id (UUID): Primary key, unique identifier for the account.
        name (str): A user-defined name for the account (e.g., "My Fidelity
            Brokerage").
        brokerage (str): The name of the brokerage firm (e.g., "Fidelity",
            "Robinhood").
        account_number (str | None): The account number, if available and
            desired to store. Must be unique if present.
        description (str | None): An optional description for the account.
        created_at (datetime.datetime): Timestamp when the account was created.
        updated_at (datetime.datetime): Timestamp when the account was last
            updated.
    """

    __tablename__ = "accounts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    brokerage: Mapped[str] = mapped_column(String(100), nullable=False)
    account_number: Mapped[str | None] = mapped_column(
        String(100), unique=True, nullable=True
    )
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
            f"<AccountModel(id={self.id}, name='{self.name}', "
            f"brokerage='{self.brokerage}', "
            f"account_number='{self.account_number}')>"
        )

