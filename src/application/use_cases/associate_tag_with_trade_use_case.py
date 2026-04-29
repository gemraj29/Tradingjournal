from abc import ABC, abstractmethod
from uuid import UUID

from src.domain.shared.result import Error, Result


class AssociateTagWithTradeUseCase(ABC):
    """
    Abstract base class for the Associate Tag With Trade Use Case.

    Defines the interface for associating an existing tag with an existing trade.
    """

    @abstractmethod
    async def execute(self, trade_id: UUID, tag_id: UUID) -> Result[bool, Error]:
        """
        Executes the use case to associate a tag with a trade.

        Args:
            trade_id: The unique identifier of the trade.
            tag_id: The unique identifier of the tag to associate.

        Returns:
            Result[bool, Error]: A result object containing True if the association
                was successful, or an Error if the operation fails (e.g., trade
                or tag not found, or association already exists).
        """
        raise NotImplementedError
