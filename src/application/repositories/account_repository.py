import abc
from uuid import UUID

from src.domain.accounts.entities import Account
from src.domain.shared.result import Error, Result


class AccountRepository(abc.ABC):
    """
    Abstract base class for Account persistence operations.

    Defines the contract for interacting with account data, ensuring
    decoupling between the application and infrastructure layers.
    All methods return a Result type for explicit error handling.
    """

    @abc.abstractmethod
    def create_account(self, account: Account) -> Result[Account, Error]:
        """
        Adds a new account to the persistence layer.

        Args:
            account: The Account entity to add.

        Returns:
            A Result containing the created Account if successful, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def get_account_by_id(self, account_id: UUID) -> Result[Account | None, Error]:
        """
        Retrieves a single account by its unique identifier.

        Args:
            account_id: The UUID of the account to retrieve.

        Returns:
            A Result containing the Account if found, None if not found, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def get_all_accounts(
        self, skip: int = 0, limit: int = 100
    ) -> Result[list[Account], Error]:
        """
        Retrieves a list of all accounts, with optional pagination.

        Args:
            skip: The number of items to skip (for pagination).
            limit: The maximum number of items to return (for pagination).

        Returns:
            A Result containing a list of Account entities, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def update_account(self, account: Account) -> Result[Account, Error]:
        """
        Updates an existing account in the persistence layer.

        Args:
            account: The Account entity with updated information.
                     The account's ID must match an existing account.

        Returns:
            A Result containing the updated Account if successful, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def delete_account(self, account_id: UUID) -> Result[bool, Error]:
        """
        Deletes an account by its unique identifier.

        Args:
            account_id: The UUID of the account to delete.

        Returns:
            A Result containing True if deletion was successful, False if not found,
            or an Error.
        """
        raise NotImplementedError
