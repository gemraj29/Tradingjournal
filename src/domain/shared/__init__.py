# This file makes the 'shared' directory a Python package.
# It can be used to expose common utilities or types from the package.
from .result import AppError, Err, Ok, Result, is_err, is_ok

__all__ = ["AppError", "Err", "Ok", "Result", "is_err", "is_ok"]
