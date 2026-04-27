from typing import Generic, TypeVar, Union

T = TypeVar("T")
E = TypeVar("E")


class Error:
    """Base class for all application errors."""

    def __init__(self, message: str, code: str = "GENERIC_ERROR"):
        self.message = message
        self.code = code

    def __repr__(self) -> str:
        return f"Error(code='{self.code}', message='{self.message}')"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Error):
            return NotImplemented
        return self.code == other.code and self.message == other.message


class Result(Generic[T, E]):
    """A type that represents either success (Ok) or failure (Err)."""

    def __init__(self, value: Union[T, E], is_ok: bool):
        self._value = value
        self._is_ok = is_ok

    @staticmethod
    def ok(value: T) -> "Result[T, E]":
        """Creates a successful Result."""
        return Result(value, True)

    @staticmethod
    def fail(error: E) -> "Result[T, E]":
        """Creates a failed Result."""
        return Result(error, False)

    @property
    def is_ok(self) -> bool:
        """Returns True if the result is Ok."""
        return self._is_ok

    @property
    def is_fail(self) -> bool:
        """Returns True if the result is Err."""
        return not self._is_ok

    def unwrap(self) -> T:
        """Returns the contained Ok value, or raises an exception if Err."""
        if self.is_ok:
            return self._value  # type: ignore
        raise ValueError("Called unwrap() on an Err value")

    def unwrap_err(self) -> E:
        """Returns the contained Err value, or raises an exception if Ok."""
        if self.is_fail:
            return self._value  # type: ignore
        raise ValueError("Called unwrap_err() on an Ok value")

    def map(self, fn) -> "Result":
        """Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a
        contained `Ok` value."""
        if self.is_ok:
            return Result.ok(fn(self._value))
        return Result.fail(self._value)

    def bind(self, fn) -> "Result":
        """Calls a function with the contained value if `Ok`, otherwise returns
        the `Err` value."""
        if self.is_ok:
            return fn(self._value)
        return Result.fail(self._value)

    def __repr__(self) -> str:
        if self.is_ok:
            return f"Ok({self._value!r})"
        return f"Err({self._value!r})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Result):
            return NotImplemented
        return self._is_ok == other._is_ok and self._value == other._value
