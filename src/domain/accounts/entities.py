"""
This module defines the core entities for the accounts domain.

Entities represent the core business objects with identity and lifecycle.
"""

import enum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class AccountType(str, enum.Enum):
    """
    Represents the type of a trading account.
    """

    BROKERAGE = "brokerage"
    IRA = "ira"
    ROTH_IRA = "roth_ira"
    FOUR_ZERO_ONE_K = "401k"
    OTHER = "other"


class Account(BaseModel):
    """
    Represents a trading account where trades are executed.

    Attributes:
        account_id (UUID): Unique identifier for the account.
        name (str): A user-friendly name for the account (e.g., "Fidelity Brokerage").
        account_type (AccountType): The type of the trading account.
        description (Optional[str]): An optional description for the account.
    """

    account_id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., min_length=1, max_length=100)
    account_type: AccountType
    description: str | None = Field(None, max_length=500)

    class Config:
        """Pydantic configuration for the Account model."""

        use_enum_values = True
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "account_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                "name": "My Fidelity Brokerage",
                "account_type": "brokerage",
                "description": "My main trading account at Fidelity.",
            }
        }
