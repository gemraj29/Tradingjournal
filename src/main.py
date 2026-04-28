"""Application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.logging import configure_logging
from .presentation.api.router_registration import register_api_routers

configure_logging()

app = FastAPI(
    title="DesignATradingjournal",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire up all API routers
register_api_routers(app)


@app.get("/health", tags=["Health"])
async def health() -> dict:
    """Liveness check — returns app status and version."""
    return {"status": "ok", "version": "0.1.0"}
