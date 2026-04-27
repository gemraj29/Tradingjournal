from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.infrastructure.persistence.models.base import Base, TimestampMixin


class TradeModel(TimestampMixin, Base):
    """
    SQLAlchemy model for a trade.
    """

    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    trade_date = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    description = Column(String, nullable=True)  # e.g., "Bought 100 shares"

    account_id = Column(
        Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False
    )
    account = relationship("AccountModel", back_populates="trades")

    trade_tags = relationship(
        "TradeTagModel", back_populates="trade", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return (
            f"<TradeModel(id={self.id}, symbol='{self.symbol}', "
            f"quantity={self.quantity}, price={self.price})>"
        )
