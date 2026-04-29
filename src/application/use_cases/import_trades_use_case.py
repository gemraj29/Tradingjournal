"""Use case: import trades from a CSV file."""

import csv
import io
import logging
from datetime import datetime
from decimal import Decimal, InvalidOperation

from src.application.repositories.trade_repository import TradeRepository
from src.domain.shared.errors import (
    ApplicationError,
    DomainError,
    InvalidCsvFormatError,
    NoTradesFoundError,
    TradeParsingError,
    TradePersistenceError,
)
from src.domain.shared.result import Err, Ok, Result
from src.domain.trades.entities import Trade, TradeType

logger = logging.getLogger(__name__)

_EXPECTED_HEADERS = {"symbol", "trade_type", "quantity", "price", "trade_date", "notes"}


class ImportTradesUseCase:
    """Import trades from a CSV string into the repository."""

    def __init__(self, trade_repository: TradeRepository) -> None:
        self._trade_repository = trade_repository

    async def execute(self, file_content: str) -> Result[int, ApplicationError]:
        """
        Parse and persist trades from CSV content.

        Expected CSV columns (case-sensitive):
            symbol, trade_type, quantity, price, trade_date, notes
        trade_date must be in YYYY-MM-DD format.

        Args:
            file_content: Raw CSV string.

        Returns:
            Ok(count) on success, or Err(ApplicationError) on failure.
        """
        logger.info("Starting trade import (content length=%d)", len(file_content))

        trades_to_import: list[Trade] = []
        reader = csv.DictReader(io.StringIO(file_content))

        # Validate headers
        if reader.fieldnames is None:
            msg = "CSV file is empty or has no headers."
            logger.error(msg)
            return Err(InvalidCsvFormatError(msg))

        missing = _EXPECTED_HEADERS - set(reader.fieldnames)
        if missing:
            msg = f"Missing required CSV columns: {sorted(missing)}"
            logger.error(msg)
            return Err(InvalidCsvFormatError(msg))

        for row_num, row in enumerate(reader, start=2):
            # Skip blank rows
            if not any(v.strip() for v in row.values()):
                logger.warning("Skipping empty row %d", row_num)
                continue

            parse_result = self._parse_row(row, row_num)
            if parse_result.is_err():
                return parse_result  # type: ignore[return-value]
            trades_to_import.append(parse_result.unwrap())

        if not trades_to_import:
            msg = "No valid trades found in the CSV file."
            logger.warning(msg)
            return Err(NoTradesFoundError(msg))

        try:
            await self._trade_repository.add_trades(trades_to_import)
            count = len(trades_to_import)
            logger.info("Successfully imported %d trades", count)
            return Ok(count)
        except Exception as exc:
            msg = f"Failed to persist trades: {exc}"
            logger.error(msg)
            return Err(TradePersistenceError(msg))

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_row(row: dict, row_num: int) -> Result[Trade, ApplicationError]:
        """Parse one CSV row into a Trade entity."""
        try:
            symbol = row["symbol"].strip()
            if not symbol:
                raise ValueError("Symbol cannot be empty.")

            try:
                trade_type = TradeType[row["trade_type"].strip().upper()]
            except KeyError:
                raise ValueError(f"Invalid trade_type: {row['trade_type']!r}")

            try:
                quantity = int(row["quantity"].strip())
            except (ValueError, TypeError):
                raise ValueError(f"Invalid quantity: {row['quantity']!r}")

            try:
                price = Decimal(row["price"].strip())
            except InvalidOperation:
                raise ValueError(f"Invalid price: {row['price']!r}")

            try:
                trade_date = datetime.strptime(
                    row["trade_date"].strip(), "%Y-%m-%d"
                ).date()
            except (ValueError, TypeError):
                raise ValueError(
                    f"Invalid trade_date (expected YYYY-MM-DD): {row['trade_date']!r}"
                )

            notes = row.get("notes", "").strip() or None

            trade = Trade.create_new(
                symbol=symbol,
                trade_type=trade_type,
                quantity=quantity,
                price=price,
                trade_date=trade_date,
                notes=notes,
            )
            return Ok(trade)

        except (ValueError, DomainError) as exc:
            msg = f"Error on row {row_num}: {exc}"
            logger.error(msg)
            return Err(TradeParsingError(msg))
        except Exception as exc:
            msg = f"Unexpected error on row {row_num}: {exc}"
            logger.error(msg)
            return Err(TradeParsingError(msg))
