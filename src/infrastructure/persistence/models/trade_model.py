from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.infrastructure.persistence.models.base_model import BaseModel

# Association table for many-to-many relationship between trades and tags
trade_tag_association_table = Table(
    "trade_tag_association",
    BaseModel.metadata,
    Column("trade_id", ForeignKey("trades.id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)


class TradeModel(BaseModel):
    """
    SQLAlchemy ORM model for a Trade entity.
    """

    __tablename__ = "trades"

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("accounts.id"), index=True
    )
    trade_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    instrument_type: Mapped[str] = mapped_column(String(50))
    symbol: Mapped[str] = mapped_column(String(50), index=True)
    quantity: Mapped[float]
    transaction_type: Mapped[str] = mapped_column(String(50))
    entry_price: Mapped[float | None]
    exit_price: Mapped[float | None]
    average_price: Mapped[float | None]
    commission: Mapped[float] = mapped_column(default=0.0)
    fees: Mapped[float] = mapped_column(default=0.0)
    net_profit_loss: Mapped[float] = mapped_column(default=0.0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_closed: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    # Assuming AccountModel will have a 'trades' back_populates relationship
    account: Mapped["AccountModel"] = relationship(back_populates="trades")
    # Assuming TagModel will have a 'trades' back_populates relationship
    tags: Mapped[list["TagModel"]] = relationship(
        secondary=trade_tag_association_table, back_populates="trades"
    )

    def __repr__(self) -> str:
        """
        Return a string representation of the TradeModel instance.
        """
        return (
            f"<TradeModel(id={self.id}, symbol='{self.symbol}', "
            f"trade_date={self.trade_date.isoformat()}, "
            f"net_profit_loss={self.net_profit_loss})>"
        )

