from abc import ABC, abstractmethod
from typing import List

from src.domain.shared.result import Result, Error
from src.domain.trades.entities import Trade


class TradeRepository(ABC):
    """Abstract base class for a trade repository."""

    @abstractmethod
    async def get_all_trades(self) -> Result[List[Trade], Error]:
        """
        Retrieves all trades from the repository.

        Returns:
            Result[List[Trade], Error]: A Result containing a list of Trade
            entities on success, or an Error on failure.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_trades_by_account(
        self, account_id: str
    ) -> Result[List[Trade], Error]:
        """
        Retrieves trades associated with a specific account ID.

        Args:
            account_id (str): The ID of the account.

        Returns:
            Result[List[Trade], Error]: A Result containing a list of Trade
            entities on success, or an Error on failure.
        """
        raise NotImplementedError

    @abstractmethod
    async def add_trade(self, trade: Trade) -> Result[Trade, Error]:
        """
        Adds a new trade to the repository.

        Args:
            trade (Trade): The trade entity to add.

        Returns:
            Result[Trade, Error]: A Result containing the added Trade entity
            on success, or an Error on failure.
        """
        raise NotImplementedError

    @abstractmethod
    async def update_trade(self, trade: Trade) -> Result[Trade, Error]:
        """
        Updates an existing trade in the repository.

        Args:
            trade (Trade): The trade entity to update.

        Returns:
            Result[Trade, Error]: A Result containing the updated Trade entity
            on success, or an Error on failure.
        """
        raise NotImplementedError

    @abstractmethod
    async def delete_trade(self, trade_id: str) -> Result[bool, Error]:
        """
        Deletes a trade from the repository by its ID.

        Args:
            trade_id (str): The ID of the trade to delete.

        Returns:
            Result[bool, Error]: A Result indicating success (True) or failure
            (False) on deletion, or an Error on failure.
