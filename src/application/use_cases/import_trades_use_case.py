from abc import ABC, abstractmethod
from uuid import UUID

from src.domain.shared.result import Error, Result


class ImportTradesUseCase(ABC):
    """
    Abstract base class for the Import Trades Use Case.

    Defines the interface for importing trade data from a CSV file
    into the application's system.
    """

    @abstractmethod
    async def execute(self, csv_content: str, account_id: UUID) -> Result[bool, Error]:
        """
        Executes the use case to import trade data from CSV content.

        This method is responsible for parsing the provided CSV content,
        validating the trade data, and persisting it to the system,
        associating it with a specific user account.

        Args:
            csv_content (str): The raw content of the CSV file as a string.
            account_id (UUID): The unique identifier of the account to which
                these trades belong.

        Returns:
            Result[bool, Error]: A result object containing True if the import
                was successful, or an Error if the operation fails (e.g.,
                parsing errors, validation failures, or database issues).
        """
        raise NotImplementedError

