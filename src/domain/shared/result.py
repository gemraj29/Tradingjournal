from typing import Generic, TypeVar, Union, Any

# Define type variables for the success value (T) and error value (E)
T = TypeVar("T")
E = TypeVar("E")


class Ok(Generic[T]):
    """Represents a successful result containing a value.

    Attributes:
        _value: The successful value.
    """

    def __init__(self, value: T) -> None:
        """Initializes an `Ok` instance with a value."""
        self._value = value

    def __repr__(self) -> str:
        """Returns a string representation of the `Ok` instance."""
        return f"Ok({self._value!r})"

    def __eq__(self, other: Any) -> bool:
        """Compares two `Ok` instances for equality."""
        return isinstance(other, Ok) and self._value == other._value

    def unwrap(self) -> T:
        """Returns the contained `Ok` value.

        This method is safe to call only after confirming the result is `Ok`
        (e.g., using `is_ok` or `isinstance`).
        """
        return self._value


class Err(Generic[E]):
    """Represents a failed result containing an error.

    Attributes:
        _error: The error value.
    """

    def __init__(self, error: E) -> None:
        """Initializes an `Err` instance with an error."""
        self._error = error

    def __repr__(self) -> str:
        """Returns a string representation of the `Err` instance."""
        return f"Err({self._error!r})"

    def __eq__(self, other: Any) -> bool:
        """Compares two `Err` instances for equality."""
        return isinstance(other, Err) and self._error == other._error

    def unwrap_err(self) -> E:
        """Returns the contained `Err` value.

        This method is safe to call only after confirming the result is `Err`
        (e.g., using `is_err` or `isinstance`).
        """
        return self._error


Result = Union[Ok[T], Err[E]]
"""A type alias for a result that can be either `Ok` or `Err`."""


def is_ok(result: Result[T, E]) -> bool:
    """Checks if the result is `Ok`.

    Args:
        result: The Result instance to check.

    Returns:
        True if the result is `Ok`, False otherwise.
    """
    return isinstance(result, Ok)


def is_err(result: Result[T, E]) -> bool:
    """Checks if the result is `Err`.

    Args:
        result: The Result instance to check.

    Returns:
        True if the result is `Err`, False otherwise.
    """
    return isinstance(result, Err)


class AppError(Exception):
    """Base class for all application-specific errors.

    Attributes:
        message: A human-readable error message.
        code: A machine-readable error code.
    """

    def __init__(self, message: str, code: str = "GENERIC_ERROR") -> None:
        """Initializes an `AppError` instance.

        Args:
            message: A human-readable error message.
            code: A machine-readable error code (default: "GENERIC_ERROR").
        """
        super().__init__(message)
        self.message = message
        self.code = code

    def __repr__(self) -> str:
        """Returns a string representation of the `AppError` instance."""
        return (
            f"{self.__class__.__name__}(code='{self.code}', "
            f"message='{self.message}')"
        )

    def __str__(self) -> str:
        """Returns a user-friendly string representation of the error."""
        return f"[{self.code}] {self.message}"

