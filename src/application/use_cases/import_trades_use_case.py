import csv
import io
import logging
from datetime import date, datetime
from decimal import Decimal
from typing import List

from src.application.repositories.trade_repository import TradeRepository
from src.domain.shared.errors import ApplicationError, DomainError
from src.domain.shared.result import Err, Ok, Result
from src.domain.trades.entities import Trade, TradeType

logger = logging.getLogger(__name__)


class ImportTradesUseCase:
    """
    Use case for importing trades from a CSV file.
    """

    def __init__(self, trade_repository: TradeRepository):
        """
        Initializes the ImportTradesUseCase with a trade repository.

        Args:
            trade_repository: The repository for managing trade data.
        """
        self._trade_repository = trade_repository

    def execute(self, file_content: str) -> Result[int, ApplicationError]:
        """
        Executes the trade import process from CSV content.

        The CSV is expected to have headers:
        'symbol', 'trade_type', 'quantity', 'price', 'trade_date', 'notes'.
        'trade_date' should be in YYYY-MM-DD format.

        Args:
            file_content: A string containing the CSV data.

        Returns:
            A Result indicating the number of trades imported on success,
            or an ApplicationError on failure.
        """
        logger.info(
            "Starting trade import process", file_content_length=len(file_content)
        )
        trades_to_import: List[Trade] = []
        reader = csv.reader(io.StringIO(file_content))

        # Assume first row is header
        try:
            headers = next(reader)
        except StopIteration:
            error_msg = "CSV file is empty or has no headers."
            logger.error(error_msg)
            return Err(InvalidCsvFormatError(error_msg))

        # Define expected headers and their mapping to Trade entity fields
        expected_headers_map = {
            "symbol": "symbol",
            "trade_type": "trade_type",
            "quantity": "quantity",
            "price": "price",
            "trade_date": "trade_date",
            "notes": "notes",
        }

        # Validate headers
        for expected_header_key in expected_headers_map.keys():
            if expected_header_key not in headers:
                error_msg = (
                    f"Missing expected header: '{expected_header_key}' in CSV. "
                    f"Found headers: {headers}"
                )
                logger.error(error_msg)
                return Err(InvalidCsvFormatError(error_msg))

        imported_count = 0
        for i, row in enumerate(reader):
            row_num = i + 2  # +1 for 0-index, +1 for header row
            if not row or all(not cell.strip() for cell in row):
                logger.warning("Skipping empty row", row_number=row_num)
                continue

            try:
                trade_data = {}
                for header, value in zip(headers, row):
                    if header in expected_headers_map:
                        trade_data[expected_headers_map[header]] = value

                # Type conversion and validation
                symbol = trade_data.get("symbol")
                if not symbol:
                    raise ValueError("Symbol cannot be empty.")

                trade_type_str = trade_data.get("trade_type")
                try:
                    trade_type = TradeType[trade_type_str.upper()]
                except (KeyError, AttributeError):
                    raise ValueError(f"Invalid trade type: {trade_type_str}")

                quantity_str = trade_data.get("quantity")
                try:
                    quantity = int(quantity_str)
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid quantity: {quantity_str}")

                price_str = trade_data.get("price")
                try:
                    price = Decimal(price_str)
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid price: {price_str}")

                trade_date_str = trade_data.get("trade_date")
                try:
                    trade_date = datetime.strptime(trade_date_str, "%Y-%m-%d").date()
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid trade date format: {trade_date_str}")

                notes = trade_data.get("notes", "")

                trade = Trade.create_new(
                    symbol=symbol,
                    trade_type=trade_type,
                    quantity=quantity,
                    price=price,
                    trade_date=trade_date,
                    notes=notes,
                )
                trades_to_import.append(trade)

            except (ValueError, TypeError, DomainError) as e:
                logger.error(
                    "Failed to parse trade row",
                    row_number=row_num,
                    error=str(e),
                    row_data=row,
                )
                # For basic implementation, fail fast on first error
                return Err(TradeParsingError(f"Error on row {row_num}: {e}"))
            except Exception as e:
                logger.error(
                    "An unexpected error occurred during row parsing",
                    row_number=row_num,
                    error=str(e),
                    row_data=row,
                )
                return Err(TradeParsingError(f"Unexpected error on row {row_num}: {e}"))

        if not trades_to_import:
            logger.warning("No valid trades found to import after parsing.")
            return Err(NoTradesFoundError("No valid trades found in the CSV file."))

        try:
            self._trade_repository.add_trades(trades_to_import)
            imported_count = len(trades_to_import)
            logger.info("Successfully imported trades", count=imported_count)
            return Ok(imported_count)
        except Exception as e:
            logger.error("Failed to persist trades", error=str(e))
            return Err(TradePersistenceError(f"Failed
