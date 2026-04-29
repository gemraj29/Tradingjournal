"""Result type for explicit success/failure handling without exceptions."""

from typing import Generic, TypeVar

E = TypeVar("E")
T = TypeVar("T")


class Error:
    """Base error type for use with Result."""

    def __init__(self, message: str) -> None:
        self.message = message

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}({self.message!r})"

    def __str__(self) -> str:
        return self.message


class Result(Generic[T, E]):
    """
    A Result type that represents either success (Ok) or failure (Err).

    Prefer the Ok() and Err() free functions to construct instances.
    """

    _value: T | E
    _is_ok: bool

    def __init__(self, value: T | E, is_ok: bool) -> None:
        self._value = value
        self._is_ok = is_ok

    # ------------------------------------------------------------------
    # Static constructors (also available as module-level Ok / Err)
    # ------------------------------------------------------------------

    @staticmethod
    def ok(value: T) -> "Result[T, E]":
        """Create a successful Result."""
        return Result(value, True)

    @staticmethod
    def fail(error: E) -> "Result[T, E]":
        """Create a failed Result."""
        return Result(error, False)

    # ------------------------------------------------------------------
    # Inspection helpers
    # ------------------------------------------------------------------

    def is_ok(self) -> bool:
        return self._is_ok

    def is_err(self) -> bool:
        return not self._is_ok

    def unwrap(self) -> T:
        """Return the success value, raising ValueError on failure."""
        if not self._is_ok:
            raise ValueError(f"Called unwrap() on an Err: {self._value}")
        return self._value  # type: ignore[return-value]

    def unwrap_err(self) -> E:
        """Return the error value, raising ValueError on success."""
        if self._is_ok:
            raise ValueError(f"Called unwrap_err() on an Ok: {self._value}")
        return self._value  # type: ignore[return-value]

    def value_or(self, default: T) -> T:
        """Return the success value, or *default* if this is an Err."""
        return self._value if self._is_ok else default  # type: ignore[return-value]

    def __repr__(self) -> str:
        label = "Ok" if self._is_ok else "Err"
        return f"{label}({self._value!r})"


# ------------------------------------------------------------------
# Module-level convenience constructors
# ------------------------------------------------------------------


def Ok(value: T) -> "Result[T, E]":  # noqa: N802
    """Construct a successful Result."""
    return Result(value, True)


def Err(error: E) -> "Result[T, E]":  # noqa: N802
    """Construct a failed Result."""
    return Result(error, False)
