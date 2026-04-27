from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from src.infrastructure.persistence.models.base import Base, TimestampMixin


class TagModel(TimestampMixin, Base):
    """
    SQLAlchemy model for a personal tag.
    """

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    trade_tags = relationship(
        "TradeTagModel", back_populates="tag", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<TagModel(id={self.id}, name='{self.name}')>"
