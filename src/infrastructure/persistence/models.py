"""
Defines the SQLAlchemy declarative base and imports all ORM models.

This module serves as the central point for defining the `Base` class
from which all SQLAlchemy models inherit. It also ensures that all
ORM models are imported, making them discoverable by Alembic for
database migrations.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy declarative models in the application.

    All ORM models should inherit from this `Base`. Alembic uses `Base.metadata`
    to detect database schema changes and generate migration scripts.
    """

    pass


# Import all ORM models here to ensure they are registered with Base.metadata
from .models.tag_model import TagModel
from .models.trade_tag_model import TradeTagModel

# Example:
# from .trade_models import TradeModel
# As models are created, add their imports here.
# from .tag_models import TagModel # This was a placeholder, now replaced by actual import
