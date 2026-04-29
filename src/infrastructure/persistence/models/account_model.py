from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from src.infrastructure.persistence.models.base import Base, TimestampMixin


class AccountModel(TimestampMixin, Base):
    """
    SQLAlchemy model for a trading account.
    """

    __tablename__ = "accounts"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    trades = relationship(
        "TradeModel", back_populates="account", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<AccountModel(id={self.id}, name='{self.name}')>"
