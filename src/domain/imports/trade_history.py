from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class TradeHistory(BaseModel):
    """
    Represents a single raw trade entry imported from a source.

    This model captures data as it appears in the import source,
    before processing into the core `Trade` domain model.
    """

    trade_date: datetime = Field(
        ..., description="The date and time the trade was executed."
    )
    symbol: str = Field(
        ..., description="The ticker symbol or identifier of the asset."
    )
    asset_type: str = Field(
        ...,
        description="The type of asset (e.g., 'STOCK', 'OPTION', 'FUTURE').",
    )
    trade_type: str = Field(
        ...,
        description="The transaction type (e.g., 'BUY', 'SELL', 'ROLL', 'EXERCISE').",
    )
    quantity: Decimal = Field(
        ..., gt=Decimal("0"), description="The number of units traded."
    )
    price: Decimal = Field(
        ..., gt=Decimal("0"), description="The price per unit of the asset."
    )
    commission: Decimal = Field(
        Decimal("0.00"),
        ge=Decimal("0"),
        description="Any commission charged for the trade.",
    )
    fees: Decimal = Field(
        Decimal("0.00"),
        ge=Decimal("0"),
        description="Any additional fees charged for the trade.",
    )
    total_amount: Decimal = Field(
        ..., description="The total monetary amount of the trade."
    )
    account_id: Optional[str] = Field(
        None, description="Identifier for the account where the trade occurred."
    )
    description: Optional[str] = Field(
        None, description="A free-text description from the source."
    )
    order_id: Optional[str] = Field(
        None, description="A unique identifier for the order, if available."
    )
