import logging
import json
import datetime

class JsonFormatter(logging.Formatter):
    """
    A custom logging formatter that outputs logs in JSON format.
    """

    def format(self, record: logging.LogRecord) -> str:
        """
        Formats a log record into a JSON string.

        Args:
            record: The log record to format.

        Returns:
            A JSON string representing the log record.
        """
        log_entry = {
            "timestamp": datetime.datetime.fromtimestamp(
                record.created, tz=datetime.timezone.utc
            ).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": self.formatMessage(record),
            "pathname": record.pathname,
            "lineno": record.lineno,
            "funcName": record.funcName,
            "process": record.process,
            "thread": record.thread,
        }

        # Add any extra attributes from the log record.
        # Filter out standard attributes already handled or internal ones.
        standard_attrs = {
            "name",
            "msg",
            "levelname",
            "levelno",
            "pathname",
            "filename",
            "module",
            "exc_info",
            "exc_text",
            "stack_info",
            "lineno",
            "funcName",
            "created",
            "msecs",
            "relativeCreated",
            "thread",
            "threadName",
            "processName",
            "process",
            "args",
            "message",  # Handled by self.formatMessage
        }
        for key, value in record.__dict__.items():
            if key not in standard_attrs and not key.startswith("_"):
                log_entry[key] = value

        return json.dumps(log_entry, ensure_ascii=False)


def configure_logging(level: int = logging.INFO) -> None:
    """
    Configures the application's structured logging.

    Args:
        level: The minimum logging level to capture (e.g., logging.INFO).
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Clear existing handlers to prevent duplicate logs
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Create a stream handler for console output
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(JsonFormatter())
    root_logger.addHandler(stream_handler)

    # Suppress propagation for common libraries to avoid duplicate or
    # unstructured logs from them, ensuring our formatter handles all
    # application-level logs.
    logging.getLogger("uvicorn.access").propagate = False
    logging.getLogger("uvicorn.error").propagate = False
    logging.getLogger("uvicorn").propagate = False
    logging.getLogger("fastapi").propagate = False
    logging.getLogger("sqlalchemy").propagate = False
    logging.getLogger("alembic").propagate = False
