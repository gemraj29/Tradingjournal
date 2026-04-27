from typing import TypeVar, Generic, Union, Callable

E = TypeVar('E')
T = TypeVar('T')
U = TypeVar('U')
F = TypeVar('F')


class Result(Generic[T, E]):
    """
    A Result type that represents either success (Ok) or failure (Err).
    """
    _value: Union[T, E]
    _is_ok: bool

    def __init__(self, value: Union[T, E], is_ok: bool):
        self._value = value
        self._is_ok = is_ok

    @staticmethod
    def ok(value: T) -> 'Result[T, E]':
        """Creates an Ok result."""
        return Result(value, True)

    @staticmethod
    def fail(error: E) -> 'Result[T, E]':
        """Creates a Fail result."""
        return Result(error, False)

    def is_ok(self) -> bool
