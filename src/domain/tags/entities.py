import uuid

from pydantic import BaseModel, Field


class Tag(BaseModel):
    """Represents a tag used to categorize trades."""

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, description="Unique identifier for the tag."
    )
    name: str = Field(..., min_length=1, max_length=50, description="Name of the tag.")

    class Config:
        """Pydantic configuration for the Tag model."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                "name": "Mistake: Over-leveraged",
            }
        }
