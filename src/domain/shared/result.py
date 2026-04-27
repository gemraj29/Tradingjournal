from typing import Generic, TypeVar, Union, Optional

T = TypeVar("T")
E = TypeVar("E", bound="Error")


class Error:
    """
    Represents an error with a code and a message.
    """

    def __init__(self, code: str, message: str, details: Optional[dict] = None):
        self.code = code
        self.message = message
        self.details = details if details is not None else {}

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Error):
            return NotImplemented
        return (
            self.code == other.code
            and self.message == other.message
            and self.details == other.details
        )

    def __hash__(self) -> int:
        return hash((self.code, self.message, frozenset(self.details.items())))

    def __str__(self) -> str:
        return f"Error(
