"""Domain and application error hierarchy."""


class DomainError(Exception):
    """Base class for all domain-layer errors."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message

    def __str__(self) -> str:
        return self.message


class ApplicationError(DomainError):
    """Base class for application-layer errors (use-case failures)."""


# ------------------------------------------------------------------
# Concrete error types used by use cases
# ------------------------------------------------------------------


class InvalidCsvFormatError(ApplicationError):
    """Raised when a CSV file has missing or malformed headers."""


class TradeParsingError(ApplicationError):
    """Raised when a specific row in the CSV cannot be parsed into a Trade."""


class NoTradesFoundError(ApplicationError):
    """Raised when a CSV file contains no valid trade rows."""


class TradePersistenceError(ApplicationError):
    """Raised when trades cannot be saved to the database."""


class TradeNotFoundError(DomainError):
    """Raised when a requested trade does not exist."""


class AccountNotFoundError(DomainError):
    """Raised when a requested account does not exist."""


class TagNotFoundError(DomainError):
    """Raised when a requested tag does not exist."""
