from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class TradeType(Enum):
    """
    Represents the type of a trade (Buy or Sell).
    """

    BUY = "BUY"
    SELL = "SELL"


@dataclass(frozen=True)
class Trade:
    """
    Represents a single trade transaction.

    Attributes:
        id: Unique identifier for the trade.
        account_id: Identifier of the account where the trade occurred.
        symbol: The ticker symbol or identifier of the traded asset.
        trade_type: The type of trade (BUY or SELL).
        quantity: The number of units traded. Must be positive.
        price: The price per unit at which the trade occurred. Cannot be
            negative.
        trade_date: The date and time when the trade occurred.
        fees: Any fees associated with the trade. Defaults to 0.0. Cannot be
            negative.
        notes: Optional notes or comments about the trade.
        tags: A list
