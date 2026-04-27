from typing import TypeVar, Generic, Optional

T = TypeVar("T")
E = TypeVar("E")


class Result(Generic[T, E]):
    """
    A generic Result type to represent either success (with a value)
    or failure (with an error).

    This pattern is used for error handling, allowing functions to return
    either a successful outcome with data or a failure with an error message,
    without resorting to exceptions for expected error conditions.
    """

    def __init__(self, is_success: bool, value: Optional[T], error: Optional[E]):
        if is_success and error is not None:
            raise ValueError("Cannot be successful and have an error.")
        if not is_success and value is not None:
            raise ValueError("Cannot be a failure and have a value.")
        if not is_success and error is None:
            raise ValueError("Failure must have an error.")

        self._is_success = is_success
        self._value = value
        self._error = error

    @property
    def is_success(self) -> bool:
        """
        Checks if the result is a success.
        """
        return self._is_success

    @property
    def is_failure(self) -> bool:
        """
        Checks if the result is a failure.
        """
        return not self._is_success

    @property
    def value(self) -> T:
        """
        Returns the value of a successful result.

        Raises:
            RuntimeError: If accessed on a failed result.
        """
        if not self._is_success:
            raise RuntimeError(
                "Cannot access value on a failed Result. "
                f"Error: {self._error}"
            )
        return self._value

    @property
    def error(self) -> E:
        """
        Returns the error of a failed result.

        Raises:
            RuntimeError: If accessed on a successful result.
        """
        if self._is_success:
            raise RuntimeError(
                "Cannot access error on a successful Result. "
                f"Value: {self._value}"
            )
        return self._error

    @staticmethod
    def ok(value: T) -> "Result[T, E]":
        """
        Creates a successful Result.

        Args:
            value: The value to encapsulate.

        Returns:
            A successful Result instance.
        """
        return Result(True, value, None)

    @staticmethod
    def fail(error: E) -> "Result[T, E]":
        """
        Creates a failed Result.

        Args:
            error: The error to encapsulate.

        Returns:
            A failed Result instance.
        """
        return Result(False, None, error)

    def __repr__(self) -> str:
        """
        Returns a string representation of the Result.
        """
        if self.is_success:
            return f"<Result: Success, Value={self.value}>"
        return f"<Result: Failure, Error={self.error}>"

