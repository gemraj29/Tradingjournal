from abc import ABC, abstractmethod
from typing import Type

from src.domain.dashboard.entities import DashboardSummary
from src.domain.shared.result import Error, Result


class GetDashboardSummaryUseCase(ABC):
    """
    Abstract base class for the Get Dashboard Summary Use Case.

    Defines the interface for retrieving a summary of dashboard data.
    """

    @abstractmethod
    async def execute(self) -> Result[DashboardSummary, Error]:
        """
        Executes the use case to retrieve the dashboard summary.

        Returns:
            Result[DashboardSummary, Error]: A result object containing either
                the DashboardSummary or an Error if the operation fails.
        """
        raise NotImplementedError
