.PHONY: install dev test lint format check clean

install:
	pip install -e ".[dev]"

dev:
	uvicorn src.main:app --reload --port 8000

test:
	pytest -v --cov=src --cov-report=term-missing

lint:
	ruff check src tests

format:
	ruff format src tests

check: lint test

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
