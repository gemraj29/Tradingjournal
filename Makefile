.PHONY: install install-frontend dev dev-backend dev-frontend test lint format check clean

# ── Install ──────────────────────────────────────────────────────────
install:
	pip install -e ".[dev]"

install-frontend:
	cd frontend && npm install

install-all: install install-frontend

# ── Dev servers ──────────────────────────────────────────────────────
# Start FastAPI backend on :8000
dev-backend:
	uvicorn src.main:app --reload --port 8000

# Start React frontend on :3000 (proxies /api → :8000)
dev-frontend:
	cd frontend && npm run dev

# Start both concurrently (requires 'concurrently': npm install -g concurrently)
dev:
	@echo "Starting backend on :8000 and frontend on :3000 ..."
	@(uvicorn src.main:app --reload --port 8000 &) && cd frontend && npm run dev

# ── Test / lint ───────────────────────────────────────────────────────
test:
	pytest -v --cov=src --cov-report=term-missing

lint:
	ruff check src tests

format:
	ruff format src tests

check: lint test

# ── Build ─────────────────────────────────────────────────────────────
build-frontend:
	cd frontend && npm run build

# ── Clean ─────────────────────────────────────────────────────────────
clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
