import logging

from fastapi import APIRouter, File, UploadFile, status

from src.application.use_cases.import_fidelity_trades_use_case import (
    ImportFidelityTradesUseCase,
)
from src.application.use_cases.import_trades_use_case import ImportTradesUseCase
from src.infrastructure.persistence.repositories.in_memory_trade_repository import (
    InMemoryTradeRepository,
)

logger = logging.getLogger(__name__)

trades_router = APIRouter(prefix="/trades", tags=["Trades"])

# Singleton in-memory repository for development
repo = InMemoryTradeRepository()


@trades_router.get("/", summary="Get all trades", status_code=status.HTTP_200_OK)
async def get_all_trades():
    """Retrieve a list of all trades."""
    result = await repo.get_all_trades()
    return {"trades": result.unwrap()}


@trades_router.get(
    "/{trade_id}", summary="Get a trade by ID", status_code=status.HTTP_200_OK
)
async def get_trade_by_id(trade_id: str):
    """Retrieve a single trade by its ID."""
    return {"message": f"Details for trade {trade_id}"}


@trades_router.post(
    "/import", summary="Import trades from CSV", status_code=status.HTTP_201_CREATED
)
async def import_trades(file: UploadFile = File(...)):
    """Import trades from an uploaded Fidelity CSV file."""
    content = await file.read()
    decoded_content = content.decode("utf-8")

    # Try Fidelity format first, fall back to standard format
    fidelity_use_case = ImportFidelityTradesUseCase(repo)
    result = await fidelity_use_case.execute(decoded_content)

    if result.is_err():
        logger.info("Fidelity import failed, trying standard format...")
        standard_use_case = ImportTradesUseCase(repo)
        result = await standard_use_case.execute(decoded_content)

    if result.is_err():
        return {"error": str(result.unwrap_err())}

    return {"message": f"Successfully imported {result.unwrap()} trades"}
