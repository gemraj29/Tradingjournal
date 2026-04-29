from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship

from src.infrastructure.persistence.models.base import Base, TimestampMixin


class TradeTagModel(TimestampMixin, Base):
    """SQLAlchemy association model for many-to-many relationship between trades and tags."""

    __tablename__ = "trade_tags"

    trade_id = Column(
        String, ForeignKey("trades.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id = Column(String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

    trade = relationship("TradeModel", back_populates="trade_tags")
    tag = relationship("TagModel", back_populates="trade_tags")

    def __repr__(self):
        return f"<TradeTagModel(trade_id={self.trade_id}, tag_id={self.tag_id})>"
