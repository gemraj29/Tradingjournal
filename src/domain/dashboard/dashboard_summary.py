from pydantic import BaseModel, Field


class DashboardSummary(BaseModel):
    """
    Represents an aggregated summary of trading performance for the dashboard.

    This model provides key metrics such as total profit, total loss, net profit/loss,
    and trade counts, which are essential for displaying an overview of trading
    activity.
    """

    total_profit: float = Field(
        ...,
        description="The total sum of profits from all winning trades.",
        ge=0.0,
    )
    total_loss: float = Field(
        ...,
        description="The total sum of losses from all losing trades. "
                    "This value is expected to be negative or zero.",
        le=0.0,
    )
    net_profit_loss: float = Field(
        ...,
        description="The net profit or loss, calculated as total_profit + total_loss.",
    )
    total_trades: int = Field(
        ...,
        description="The total number of trades executed.",
        ge=0,
    )
    winning_trades: int = Field(
        ...,
        description="The number of trades that resulted in a profit.",
        ge=0,
    )
    losing_trades: int = Field(
        ...,
        description="The number of trades that resulted in a loss.",
        ge=0,
    )
    win_rate: float = Field(
        ...,
        description="The percentage of winning trades out of total trades. "
                    "Calculated as (winning_trades / total_trades) * 100. "
                    "Returns 0.0 if total_trades is 0.",
        ge=0.0,
        le=100.0,
    )
