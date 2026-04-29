"""Use case: import trades from a Fidelity CSV file."""

import csv
import io
import logging
from datetime import datetime
from decimal import Decimal

from src.application.repositories.trade_repository import TradeRepository
from src.domain.shared.errors import (
    ApplicationError,
    InvalidCsvFormatError,
    NoTradesFoundError,
    TradePersistenceError,
)
from src.domain.shared.result import Err, Ok, Result
from src.domain.trades.entities import Trade, TradeType

logger = logging.getLogger(__name__)

_FIDELITY_HEADERS = {"Run Date", "Action", "Symbol", "Quantity", "Price"}


class ImportFidelityTradesUseCase:
    """Import trades from a Fidelity CSV string into the repository."""

    def __init__(self, trade_repository: TradeRepository) -> None:
        self._trade_repository = trade_repository

    async def execute(self, file_content: str) -> Result[int, ApplicationError]:
        logger.info("Starting Fidelity trade import")

        trades_to_import: list[Trade] = []
        # Fidelity CSVs often have some preamble. We need to find the header row.
        lines = file_content.splitlines()
        header_row_idx = -1
        for i, line in enumerate(lines):
            if "Run Date" in line and "Symbol" in line:
                header_row_idx = i
                break

        if header_row_idx == -1:
            msg = "Could not find Fidelity CSV header row."
            logger.error(msg)
            return Err(InvalidCsvFormatError(msg))

        csv_data = "\n".join(lines[header_row_idx:])
        reader = csv.DictReader(io.StringIO(csv_data))

        for row_num, row in enumerate(reader, start=header_row_idx + 2):
            if not row.get("Symbol") or not row.get("Action"):
                continue

            action = row["Action"].upper()
            if "BOUGHT" in action:
                trade_type = TradeType.BUY
            elif "SOLD" in action:
                trade_type = TradeType.SELL
            else:
                continue  # Skip other actions like dividends, etc.

            try:
                symbol = row["Symbol"].strip()
                quantity = int(float(row["Quantity"].strip().replace(",", "")))
                price = Decimal(row["Price"].strip().replace("$", "").replace(",", ""))

                # Fidelity date format is usually MM/DD/YYYY
                trade_date = datetime.strptime(
                    row["Run Date"].strip(), "%m/%d/%Y"
                ).date()

                trade = Trade.create_new(
                    symbol=symbol,
                    trade_type=trade_type,
                    quantity=quantity,
                    price=price,
                    trade_date=trade_date,
                    notes=f"Fidelity Import: {row['Action']}",
                )
                trades_to_import.append(trade)
            except Exception as exc:
                logger.warning("Failed to parse Fidelity row %d: %s", row_num, exc)
                continue

        if not trades_to_import:
            msg = "No valid trades found in the Fidelity CSV file."
            return Err(NoTradesFoundError(msg))

        try:
            await self._trade_repository.add_trades(trades_to_import)
            return Ok(len(trades_to_import))
        except Exception as exc:
            return Err(TradePersistenceError(str(exc)))
