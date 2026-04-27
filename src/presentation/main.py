from fastapi import FastAPI


def create_app() -> FastAPI:
    """
    Creates and configures the FastAPI application instance.

    Returns:
        FastAPI: The configured FastAPI application.
    """
    app = FastAPI(
        title="DesignATradingjournal API",
        description="API for the DesignATradingjournal application.",
        version="0.1.0",
    )

    @app.get("/")
    async def read_root() -> dict[str, str]:
        """
        Root endpoint for the API.

        Returns:
            dict[str, str]: A simple welcome message.
        """
        return {"message": "Welcome to DesignATradingjournal API!"}

    return app


app = create_app()
