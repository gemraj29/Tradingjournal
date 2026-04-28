# This file makes the 'shared' directory a Python package.
# It can be used to expose common utilities or types from the package.
from .errors import ApplicationError, DomainError
from .result import Err, Error, Ok, Result

# AppError alias for backwards compatibility
AppError = Error

# Convenience helpers
def is_ok(result: Result) -> bool:
    return result.is_ok()

def is_err(result: Result) -> bool:
    return result.is_err()

__all__ = [
    "AppError",
    "ApplicationError",
    "DomainError",
    "Err",
    "Error",
    "Ok",
    "Result",
    "is_err",
    "is_ok",
]
