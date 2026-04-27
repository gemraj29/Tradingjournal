from fastapi import APIRouter, status

trades_router = APIRouter(prefix="/trades", tags=["Trades"])


@trades_router.get(
    "/",
    summary="Get all trades",
    status_code=status.HTTP_200_OK,
)
async def get_all_trades():
    """
    Retrieve a list of all trades.

    Returns:
        A dictionary with a message indicating the list of trades.
    """
    return {"message": "List of trades"}


@trades_router.get(
    "/{trade_id}",
    summary="Get a specific trade by ID",
    status_code=status.HTTP_200_OK,
)
async def get_trade_by_id(trade_id: str):
    """
    Retrieve details for a specific trade using its ID.

    Args:
        trade_id: The unique identifier of the trade.

    Returns:
        A dictionary with a message indicating the retrieved trade.
    """
    return {"message": f"Details for trade {trade_id}"}
