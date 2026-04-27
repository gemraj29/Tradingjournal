from abc import ABC, abstractmethod
from decimal import Decimal
from uuid import UUID

from src.domain.shared.result import Error, Result


class CalculatePnlUseCase(ABC):
    """
    Abstract base class for the Calculate PnL Use Case.

    Defines the interface for calculating the Profit and Loss (PnL) for a
    specific trade or a series of related trade transactions.
    """

    @abstractmethod
    async def execute(self, trade_id: UUID) -> Result[Decimal, Error]:
        """
        Executes the use case to calculate the PnL for a given trade.

        This method should account for complex scenarios like averaging,
        rolling options, and multiple transactions related to a single
        logical trade position.

        Args:
            trade_id (UUID): The unique identifier of the trade or trade
                series for which to calculate PnL.

        Returns:
            Result[Decimal, Error]: A result object containing either the
                calculated PnL as a Decimal or an Error if the operation fails.
                A dedicated `TradePnl` entity might be used in the future
                to encapsulate more details.
        """
        raise NotImplementedError
