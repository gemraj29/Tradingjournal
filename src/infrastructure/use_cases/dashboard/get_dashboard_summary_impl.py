"""Concrete implementation of GetDashboardSummaryUseCase."""

import logging
from decimal import Decimal

from src.application.use_cases.get_dashboard_summary_use_case import (
    GetDashboardSummaryUseCase,
)
from src.domain.dashboard.entities import DashboardSummary
from src.domain.shared.result import Error, Ok, Result

logger = logging.getLogger(__name__)


class GetDashboardSummaryImpl(GetDashboardSummaryUseCase):
    """
    Retrieves a high-level P&L summary for the dashboard.

    Currently returns an in-memory stub; replace the body of execute()
    with real DB queries once the trade repository is wired up.
    """

    async def execute(self) -> Result[DashboardSummary, Error]:
        """Return a DashboardSummary aggregated from persisted trades."""
        logger.info("Fetching dashboard summary")

        # TODO: inject TradeRepository and compute from real data
        summary = DashboardSummary(
            total_profit_loss=Decimal("0.00"),
            total_trades=0,
            winning_trades=0,
            losing_trades=0,
        )
        return Ok(summary)
