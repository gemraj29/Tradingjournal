"""
SQLAlchemy ORM model for the TradeTag association table.

This model defines the many-to-many relationship between TradeModel and TagModel.
"""

import uuid

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from src.infrastructure.persistence.models import Base


class TradeTagModel(Base):
    """
    Represents the association table between trades and tags.

    This table links `TradeModel` and `TagModel` to implement a many-to-many
    relationship, allowing a trade to have multiple tags and a tag to be
    associated with multiple trades.
    """

    __tablename__ = "trade_tags"

    trade_id = Column(
        UUID(as_uuid=True),
        ForeignKey("trades.id", ondelete="CASCADE"),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        index=True,
    )
    tag_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        index=True,
    )


