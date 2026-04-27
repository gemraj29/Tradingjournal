from fastapi import FastAPI

from src.presentation.api.routers.trades import trades_router


def register_api_routers(app: FastAPI) -> None:
    """
    Registers all API routers with the main FastAPI application.

    This function includes all feature-specific routers into the main
    FastAPI application instance, organizing the API endpoints.

    Args:
        app: The FastAPI application instance to which routers will be
            registered.
    """
    app.include_router(trades_router)
    # Add other routers here as they are created, e.g.:
    # from src.presentation.api.routers.tags import tags_router
    # app.include_router(tags_router)
    # from src.presentation.api.routers.imports import imports_router
    # app.include_router(imports_router)
