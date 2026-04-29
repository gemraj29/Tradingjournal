"""Abstract trade repository interface."""

from abc import ABC, abstractmethod

from src.domain.shared.result import Error, Result
from src.domain.trades.entities import Trade


class TradeRepository(ABC):
    """Abstract base class for a trade repository."""

    @abstractmethod
    async def get_all_trades(self) -> Result[list[Trade], Error]:
        """
        Retrieves all trades from the repository.

        Returns:
            Result containing a list of Trade entities on success,
            or an Error on failure.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_trades_by_account(
        self, account_id: str
    ) -> Result[list[Trade], Error]:
        """
        Retrieves trades associated with a specific account ID.

        Args:
            account_id: The ID of the account.

        Returns:
            Result containing a list of Trade entities on success,
            or an Error on failure.
        """
        raise NotImplementedError

    @abstractmethod
    async def add_trade(self, trade: Trade) -> Result[Trade, Error]:
        """
        Adds a single trade to the repository.

        Args:
            trade: The Trade entity to add.

        Returns:
            Result containing the added Trade entity on success,
            or an Error on failure.
        """
        raise NotImplementedError

    @abstractmethod
    async def add_trades(self, trades: list[Trade]) -> Result[int, Error]:
        """
        Bulk-inserts a list of trades.

        Args:
            trades: List of Trade entities to add.

        Returns:
            Result containing the number of trades inserted on success,
            or an Error on failure.
        """
        raise NotImplementedError

    @abstractmethod
    async def update_trade(self, trade: Trade) -> Result[Trade, Error]:
        """
        Updates an existing trade in the repository.

        Args:
            trade: The Trade entity to update.

        Returns:
            Result containing the updated Trade entity on success,
            or an Error on failure.
        """
        raise NotImplementedError

    @abstractmethod
    async def delete_trade(self, trade_id: str) -> Result[bool, Error]:
        """
        Deletes a trade from the repository by its ID.

        Args:
            trade_id: The ID of the trade to delete.

        Returns:
            Result containing True on successful deletion,
            or an Error on failure.
        """
        raise NotImplementedError
