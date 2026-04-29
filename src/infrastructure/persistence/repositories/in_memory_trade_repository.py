"""In-memory implementation of TradeRepository for initial development."""

import logging
from typing import Dict, List

from src.application.repositories.trade_repository import TradeRepository
from src.domain.shared.result import Error, Ok, Result
from src.domain.trades.entities import Trade

logger = logging.getLogger(__name__)


class InMemoryTradeRepository(TradeRepository):
    """
    A simple in-memory repository to allow development without a live DB.
    """

    def __init__(self) -> None:
        self._trades: Dict[str, Trade] = {}

    async def get_all_trades(self) -> Result[List[Trade], Error]:
        return Ok(list(self._trades.values()))

    async def get_trades_by_account(
        self, account_id: str
    ) -> Result[List[Trade], Error]:
        filtered = [t for t in self._trades.values() if t.account_id == account_id]
        return Ok(filtered)

    async def add_trade(self, trade: Trade) -> Result[Trade, Error]:
        self._trades[trade.id] = trade
        logger.info("Added trade %s to in-memory store", trade.id)
        return Ok(trade)

    async def add_trades(self, trades: List[Trade]) -> Result[int, Error]:
        for trade in trades:
            self._trades[trade.id] = trade
        logger.info("Added %d trades to in-memory store", len(trades))
        return Ok(len(trades))

    async def update_trade(self, trade: Trade) -> Result[Trade, Error]:
        self._trades[trade.id] = trade
        return Ok(trade)

    async def delete_trade(self, trade_id: str) -> Result[bool, Error]:
        if trade_id in self._trades:
            del self._trades[trade_id]
            return Ok(True)
        return Ok(False)
