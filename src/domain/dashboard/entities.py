from dataclasses import dataclass


@dataclass(frozen=True)
class DashboardSummary:
    """Represents a summary of trading performance for the dashboard."""

    total_profit_loss: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float  # Percentage, e.g., 0.65 for 65%
    average_profit_per_trade: float
    average_loss_per_trade: float
    largest_win: float
    largest_loss: float
