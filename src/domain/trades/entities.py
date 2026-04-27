import datetime
import uuid
from enum import Enum

from pydantic import BaseModel, Field
from pydantic.types import confloat, PositiveInt


class AssetType(str, Enum):
    """
    Represents the type of asset traded.
    """
    STOCK = "STOCK"
    OPTION = "OPTION"
    FUTURE = "FUTURE"
    CRYPTO = "CRYPTO"
    FOREX = "FOREX"


class TradeType(str, Enum):
    """
    Represents the type of transaction for a trade.
    """
    BUY = "BUY"
    SELL = "SELL"


class Trade(BaseModel):
    """
    Represents a single trading transaction or a completed trade.

    Attributes:
        id (uuid.UUID): Unique identifier for the trade.
        symbol (str): The ticker symbol or identifier of the asset.
        asset_type (AssetType): The type of asset traded (e.g., Stock, Option).
        trade_type (TradeType): The type of transaction (Buy or Sell).
        quantity (PositiveInt): The number of units traded. Must be positive.
        entry_price (confloat(gt=0)): The price at which the trade was entered.
        exit_price (confloat(gt=0) | None): The price at which the trade was exited.
                                            None if the trade is still open or a
                                            single leg.
        trade_date (datetime.datetime): The date and time the trade was initiated.
        exit_date (datetime.datetime | None): The date and time the trade was closed.
                                              None if the trade is still open or a
                                              single leg.
        profit_loss (confloat | None): The calculated profit or loss for the trade.
                                       None if not yet calculated or trade is open.
        tags (list[str]): A list of personal tags for the trade.
        notes (str | None): Any additional notes or comments about the trade.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4,
                          description="Unique trade identifier")
    symbol: str = Field(..., min_length=1,
                        description="Ticker symbol or asset identifier")
    asset_type: AssetType = Field(..., description="Type of asset traded")
    trade_type: TradeType = Field(...,
                                  description="Type of transaction (Buy/Sell)")
    quantity: PositiveInt = Field(..., description="Number of units traded")
    entry_price: confloat(gt=0) = Field(
        ..., description="Price at which the trade was entered"
    )
    exit_price: confloat(gt=0) | None = Field(
        None, description="Price at which the trade was exited (if closed)"
    )
    trade_date: datetime.datetime = Field(
        ..., description="Date and time the trade was initiated"
    )
    exit_date: datetime.datetime | None = Field(
        None, description="Date and time the trade was closed (if closed)"
    )
    profit_loss: confloat | None = Field(
        None, description="Calculated profit or loss for the trade (if closed)"
    )
    tags: list[str] = Field(default_factory=list,
                            description="Personal tags for the trade")
    notes: str | None = Field(None,
                              description="Additional notes about the trade")

    class Config:
        """Pydantic model configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "symbol": "AAPL",
                "asset_type": "STOCK",
                "trade_type": "BUY",
                "quantity": 10,
                "entry_price": 150.25,
                "exit_price": 155.50,
                "trade_date": "2023-01-15T09:30:00Z",
                "exit_date": "2023-01-20T16:00:00Z",
                "profit_loss": 52.50,
                "tags": ["swing_trade", "tech_stock"],
                "notes": "Bought on dip, sold for quick profit."
            }
        }
