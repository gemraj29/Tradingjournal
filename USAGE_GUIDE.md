# DesignATradingJournal — Usage Guide

A trading journal app for tracking options, stocks, and futures trades. Supports Fidelity CSV import, P&L tracking, trade tagging, and daily/weekly/monthly dashboard views.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [Environment Setup](#3-environment-setup)
4. [Running with Docker (Recommended)](#4-running-with-docker-recommended)
5. [Running Locally (Without Docker)](#5-running-locally-without-docker)
6. [Database Migrations](#6-database-migrations)
7. [Importing Trades from CSV](#7-importing-trades-from-csv)
8. [API Reference](#8-api-reference)
9. [Running Tests](#9-running-tests)
10. [Development Tools](#10-development-tools)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | >= 3.10 | Required for local runs |
| Docker | >= 24.x | Required for Docker mode |
| Docker Compose | >= 2.x | Usually bundled with Docker Desktop |
| PostgreSQL | 16 (via Docker) | Or a local install if running without Docker |

Check your versions:

```bash
python3 --version
docker --version
docker compose version
```

---

## 2. Project Structure

```
designatradingjournal/
├── src/
│   ├── main.py                  # App entry point (FastAPI instance)
│   ├── core/                    # Config, database, logging
│   ├── domain/                  # Pure business logic (trades, tags, accounts, dashboard)
│   ├── application/             # Use cases (import trades, calculate P&L, dashboard)
│   ├── infrastructure/          # DB models, migrations, repositories
│   └── presentation/            # API routers (trades, tags)
├── tests/                       # pytest test suite
├── docs/                        # Architecture, API, and flowchart docs
├── docker-compose.yml           # PostgreSQL + app services
├── Dockerfile                   # App container definition
├── Makefile                     # Shortcut commands
├── pyproject.toml               # Python dependencies
├── alembic.ini                  # Database migration config
├── .env.example                 # Environment variable template
└── run.sh                       # ← All-in-one run script (see below)
```

---

## 3. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```dotenv
# App
APP_ENV=development
DEBUG=true
SECRET_KEY=change-me-in-production

# Database (update if running locally without Docker)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/tradingjournal_db
```

**Docker Compose already sets `DATABASE_URL` automatically** — you only need to adjust it for local (non-Docker) runs.

---

## 4. Running with Docker (Recommended)

This starts both the app and a PostgreSQL database in containers.

```bash
./run.sh docker
```

Or manually:

```bash
docker compose up --build
```

The API will be available at **http://localhost:8000**.

Interactive API docs (Swagger UI) are at **http://localhost:8000/docs** (development mode only).

To stop and remove containers:

```bash
./run.sh stop
# or
docker compose down
```

To stop and also wipe the database volume:

```bash
docker compose down -v
```

---

## 5. Running Locally (Without Docker)

You need a running PostgreSQL instance. Update `DATABASE_URL` in your `.env` to point to it.

**Step 1 — Install dependencies:**

```bash
./run.sh install
# or
pip install -e ".[dev]"
```

**Step 2 — Run database migrations:**

```bash
./run.sh migrate
# or
alembic upgrade head
```

**Step 3 — Start the development server:**

```bash
./run.sh local
# or
uvicorn src.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**.

---

## 6. Database Migrations

Alembic manages the database schema.

| Command | Description |
|---------|-------------|
| `./run.sh migrate` | Apply all pending migrations (upgrade to latest) |
| `alembic upgrade head` | Same as above |
| `alembic downgrade -1` | Roll back the last migration |
| `alembic revision --autogenerate -m "description"` | Generate a new migration from model changes |
| `alembic history` | Show migration history |
| `alembic current` | Show currently applied revision |

---

## 7. Importing Trades from CSV

The app accepts CSV files in the following format. This is compatible with Fidelity trade history exports (with column renaming).

### Expected CSV Format

```csv
symbol,trade_type,quantity,price,trade_date,notes
AAPL,BUY,10,175.50,2024-01-15,Earnings play
AAPL,SELL,10,182.00,2024-01-22,Target hit
SPY240315C00500000,BUY,5,2.35,2024-01-10,Momentum trade
SPY240315C00500000,SELL,5,1.80,2024-02-28,Rolled to next expiry
```

### Column Definitions

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `symbol` | string | Yes | Ticker symbol (e.g. `AAPL`, `SPY240315C00500000`) |
| `trade_type` | string | Yes | `BUY`, `SELL`, `ROLL`, or `EXERCISE` |
| `quantity` | integer | Yes | Number of shares/contracts |
| `price` | decimal | Yes | Price per unit |
| `trade_date` | date | Yes | Format: `YYYY-MM-DD` |
| `notes` | string | No | Free-text notes — use for tagging mistakes, strategy notes, etc. |

### Importing via API

```bash
curl -X POST http://localhost:8000/trades/import \
  -H "Content-Type: multipart/form-data" \
  -F "file=@my_trades.csv"
```

---

## 8. API Reference

Base URL: `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs`

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Returns app status and version |

```bash
curl http://localhost:8000/health
# → {"status":"ok","version":"0.1.0"}
```

### Trades

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trades/` | List all trades |
| GET | `/trades/{trade_id}` | Get a specific trade by ID |
| POST | `/trades/import` | Import trades from CSV upload |

```bash
# List trades
curl http://localhost:8000/trades/

# Get a specific trade
curl http://localhost:8000/trades/abc-123
```

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tags/` | List all tags |
| POST | `/tags/` | Create a new tag |
| DELETE | `/tags/{tag_name}` | Delete a tag |

```bash
# List tags
curl http://localhost:8000/tags/

# Create a tag
curl -X POST "http://localhost:8000/tags/?tag_name=averaging-mistake"

# Delete a tag
curl -X DELETE http://localhost:8000/tags/averaging-mistake
```

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/summary` | Overall P&L, win rate, trade count |
| GET | `/dashboard/daily` | Daily calendar view of trades and profits |
| GET | `/dashboard/weekly` | Weekly aggregated performance |
| GET | `/dashboard/monthly` | Monthly aggregated performance |

---

## 9. Running Tests

```bash
./run.sh test
# or
pytest -v --cov=src --cov-report=term-missing
```

Tests live in the `tests/` directory and use `pytest-asyncio` for async endpoint testing.

---

## 10. Development Tools

All shortcuts are available via `make` or `./run.sh`:

| Command | What it does |
|---------|-------------|
| `./run.sh docker` | Start app + DB with Docker Compose |
| `./run.sh local` | Run dev server locally (hot reload) |
| `./run.sh install` | Install Python dependencies |
| `./run.sh migrate` | Run Alembic database migrations |
| `./run.sh test` | Run pytest test suite |
| `./run.sh lint` | Run linter (ruff) |
| `./run.sh format` | Auto-format code (ruff format) |
| `./run.sh stop` | Stop Docker containers |
| `make dev` | Same as `./run.sh local` |
| `make test` | Same as `./run.sh test` |

---

## 11. Troubleshooting

### "Connection refused" on startup

Make sure PostgreSQL is running. In Docker mode, the `db` container must be healthy before the `app` container starts (handled by `depends_on`). Check with:

```bash
docker compose ps
docker compose logs db
```

### "Relation does not exist" database errors

Migrations haven't been applied. Run:

```bash
./run.sh migrate
# or inside Docker:
docker compose exec app alembic upgrade head
```

### Port 8000 already in use

Change the host port in `docker-compose.yml` (e.g., `"8001:8000"`) or kill the process using port 8000:

```bash
lsof -ti:8000 | xargs kill -9
```

### CSV import fails with "Missing expected header"

Ensure your CSV has exactly these column names (case-sensitive):
`symbol`, `trade_type`, `quantity`, `price`, `trade_date`, `notes`

Dates must be in `YYYY-MM-DD` format. Fidelity exports use a different format — rename columns before importing.

### Docker build is slow

The first build downloads the base image and compiles C extensions for `asyncpg`. Subsequent builds use layer caching and are much faster.
