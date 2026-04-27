from fastapi import FastAPI, status

from src.infrastructure.logging.logging_config import configure_logging
from src.presentation.api.router_registration import register_api_routers

# Configure structured JSON logging early in the application startup
configure_logging()

app = FastAPI(
    title="DesignATradingjournal API",
    description="API for the Trading Journal application, "
    "providing endpoints for managing trades, tags, imports, "
    "and dashboard functionalities.",
    version="0.1.0",
)

# Register all API routers defined in the presentation layer
register_api_routers(app)


@app.get(
    "/",
    summary="Root endpoint",
    status_code=status.HTTP_200_OK,
    tags=["Health Check"],
)
async def root():
    """
    Root endpoint for the API.

    Provides a basic health check and welcome message for the API.
    """
    return {"message": "Welcome to DesignATradingjournal API!"}
