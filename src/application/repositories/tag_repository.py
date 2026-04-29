import abc
from uuid import UUID

from src.domain.shared.result import Error, Result
from src.domain.tags.entities import Tag


class TagRepository(abc.ABC):
    """
    Abstract base class for Tag persistence operations.

    Defines the contract for interacting with tag data, ensuring
    decoupling between the application and infrastructure layers.
    All methods return a Result type for explicit error handling.
    """

    @abc.abstractmethod
    def create_tag(self, tag: Tag) -> Result[Tag, Error]:
        """
        Adds a new tag to the persistence layer.

        Args:
            tag: The Tag entity to add.

        Returns:
            A Result containing the created Tag if successful, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def get_tag_by_id(self, tag_id: UUID) -> Result[Tag | None, Error]:
        """
        Retrieves a single tag by its unique identifier.

        Args:
            tag_id: The UUID of the tag to retrieve.

        Returns:
            A Result containing the Tag if found, None if not found, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def get_all_tags(self, skip: int = 0, limit: int = 100) -> Result[list[Tag], Error]:
        """
        Retrieves a list of all tags, with optional pagination.

        Args:
            skip: The number of items to skip (for pagination).
            limit: The maximum number of items to return (for pagination).

        Returns:
            A Result containing a list of Tag entities, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def update_tag(self, tag: Tag) -> Result[Tag, Error]:
        """
        Updates an existing tag in the persistence layer.

        Args:
            tag: The Tag entity with updated information.
                 The tag's ID must match an existing tag.

        Returns:
            A Result containing the updated Tag if successful, or an Error.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def delete_tag(self, tag_id: UUID) -> Result[bool, Error]:
        """
        Deletes a tag by its unique identifier.

        Args:
            tag_id: The UUID of the tag to delete.

        Returns:
            A Result containing True if deletion was successful, False if not found,
            or an Error.
        """
        raise NotImplementedError
