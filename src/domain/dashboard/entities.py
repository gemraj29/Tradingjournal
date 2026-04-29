from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class DashboardSummary:
    """
    Represents a high-level summary of trading performance for the dashboard.
    """

    total_profit_loss: Decimal
    total_trades: int
    winning_trades: int
    losing_trades: int
    # Add more fields as needed, e.g.,
    # total_volume: Decimal
    # average_pnl_per_trade: Decimal
    # win_rate: Decimal
    # best_trade_pnl: Decimal
    # worst_trade_pnl: Decimal
    # monthly_pnl_breakdown: dict[str, Decimal]
    # weekly_pnl_breakdown: dict[str, Decimal]
    # daily_pnl_breakdown: dict[str, Decimal]
