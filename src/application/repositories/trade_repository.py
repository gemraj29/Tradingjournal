import abc
from typing import List, Optional
from uuid import UUID

from src.domain.shared.result import Error, Result
from src.domain.trades.entities import Trade


class TradeRepository(abc.ABC):
    """
    Abstract base class for Trade persistence operations.

    Defines the contract for interacting with trade data, ensuring
    decoupling between the application and infrastructure layers.
    All methods return a Result type for explicit error handling.
    """

    @abc.abstractmethod
    def create_trade(self, trade: Trade) -> Result[Trade, Error]:
        """
        Adds a new trade to the persistence layer.

        Args:
            trade: The Trade entity to add.

        Returns:
            A Result containing the created Trade if successful, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def get_trade_by_id(self, trade_id: UUID) -> Result[Optional[Trade], Error]:
        """
        Retrieves a single trade by its unique identifier.

        Args:
            trade_id: The UUID of the trade to retrieve.

        Returns:
            A Result containing the Trade if found, None if not found, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def get_all_trades(
        self, skip: int = 0, limit: int = 100
    ) -> Result[List[Trade], Error]:
        """
        Retrieves a list of all trades, with optional pagination.

        Args:
            skip: The number of items to skip (for pagination).
            limit: The maximum number of items to return (for pagination).

        Returns:
            A Result containing a list of Trade entities, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def update_trade(self, trade: Trade) -> Result[Trade, Error]:
        """
        Updates an existing trade in the persistence layer.

        Args:
            trade: The Trade entity with updated information.
                   The trade's ID must match an existing trade.

        Returns:
            A Result containing the updated Trade if successful, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def delete_trade(self, trade_id: UUID) -> Result[bool, Error]:
        """
        Deletes a trade by its unique identifier.

        Args:
            trade_id: The UUID of the trade to delete.

        Returns:
            A Result containing True if deletion was successful, False if not found,
            or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def get_trades_by_account_id(
        self, account_id: UUID, skip: int = 0, limit: int = 100
    ) -> Result[List[Trade], Error]:
        """
        Retrieves a list of trades associated with a specific account.

        Args:
            account_id: The UUID of the account.
            skip: The number of items to skip (for pagination).
            limit: The maximum number of items to return (for pagination).

        Returns:
            A Result containing a list of Trade entities, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def get_trades_by_tag_id(
        self, tag_id: UUID, skip: int = 0, limit: int = 100
    ) -> Result[List[Trade], Error]:
        """
        Retrieves a list of trades associated with a specific tag.

        Args:
            tag_id: The UUID of the tag.
            skip: The number of items to skip (for pagination).
            limit: The maximum number of items to return (for pagination).

        Returns:
            A Result containing a list of Trade entities, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def get_trades_by_import_id(
        self, import_id: UUID, skip: int = 0, limit: int = 100
    ) -> Result[List[Trade], Error]:
        """
        Retrieves a list of trades associated with a specific import.

        Args:
            import_id: The UUID of the import.
            skip: The number of items to skip (for pagination).
            limit: The maximum number of items to return (for pagination).

        Returns:
            A Result containing a list of Trade entities, or an Error.
        """
        raise NotImplementedError

