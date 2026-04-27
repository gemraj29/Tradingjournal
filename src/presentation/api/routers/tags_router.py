from fastapi import APIRouter

router = APIRouter(
    prefix="/tags",
    tags=["Tags"],
)


@router.get("/")
async def get_all_tags() -> list[str]:
    """
    Retrieves a list of all available tags.

    This is a placeholder endpoint.
    """
    return ["example_tag_1", "example_tag_2"]


@router.post("/")
async def create_tag(tag_name: str) -> str:
    """
    Creates a new tag.

    This is a placeholder endpoint.
    Args:
        tag_name: The name of the tag to create.
    """
    return f"Tag '{tag_name}' created successfully."


@router.delete("/{tag_name}")
async def delete_tag(tag_name: str) -> str:
    """
    Deletes an existing tag.

    This is a placeholder endpoint.
    Args:
        tag_name: The name of the tag to delete.
    """
    return f"Tag '{tag_name}' deleted successfully."
