import logging

from fastapi import APIRouter, status

from src.infrastructure.logging.logging_config import configure_logging

configure_logging()
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/trades",
    tags=["trades"],
)


@router.get(
    "/",
    summary="Retrieve a list of trades",
    status_code=status.HTTP_200_OK,
)
async def get_trades() -> list[dict]:
    """
    Retrieves a list of all trades.

    This is a placeholder endpoint for fetching trade data.
    """
    logger.info("Received request to get trades")
    # Placeholder for future implementation
    return [{"id": "1", "symbol": "AAPL", "type": "BUY", "quantity": 10}]


@router.get(
    "/{trade_id}",
    summary="Retrieve a specific trade by ID",
    status_code=status.HTTP_200_OK,
)
async def get_trade_by_id(trade_id: str) -> dict:
    """
    Retrieves a specific trade by its ID.

    Args:
        trade_id: The unique identifier of the trade.
    """
    logger.info("Received request to get trade by ID: %s", trade_id)
    # Placeholder for future implementation
    return {"id": trade_id, "symbol": "MSFT", "type": "SELL", "quantity": 5}
