"""Trade domain entities."""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from enum import Enum
from uuid import uuid4


class TradeType(str, Enum):
    """Valid trade action types."""

    BUY = "BUY"
    SELL = "SELL"
    ROLL = "ROLL"
    EXERCISE = "EXERCISE"


@dataclass(frozen=True)
class Trade:
    """Represents a single trade transaction."""

    id: str
    symbol: str
    trade_type: TradeType
    quantity: float
    price: Decimal
    trade_date: date
    account_id: str
    profit_loss: Decimal = Decimal("0.00")
    notes: str | None = None
    tags: list[str] | None = None

    @classmethod
    def create_new(
        cls,
        symbol: str,
        trade_type: TradeType,
        quantity: int,
        price: Decimal,
        trade_date: date,
        account_id: str = "default",
        notes: str | None = None,
    ) -> "Trade":
        """
        Factory method for creating a new Trade with a generated UUID.

        Args:
            symbol: Ticker symbol (e.g. 'AAPL', 'SPY240315C00500000').
            trade_type: The TradeType enum value.
            quantity: Number of shares / contracts.
            price: Price per unit.
            trade_date: Date the trade was executed.
            account_id: Account identifier (defaults to 'default').
            notes: Optional free-text notes.

        Returns:
            A new Trade instance with a generated id.
        """
        return cls(
            id=str(uuid4()),
            symbol=symbol,
            trade_type=trade_type,
            quantity=float(quantity),
            price=price,
            trade_date=trade_date,
            account_id=account_id,
            notes=notes,
        )
