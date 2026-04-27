from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass(frozen=True)
class Trade:
    """Represents a single trade transaction."""

    id: str
    symbol: str
    trade_type: str  # e.g., 'BUY', 'SELL'
    quantity: float
    price: float
    trade_date: datetime
    profit_loss: float
    account_id: str
    tags: Optional[list[str]] = None
    notes: Optional[str] = None
