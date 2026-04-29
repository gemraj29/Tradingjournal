# DesignATradingjournal — Architecture

## Overview

A full-stack trading journal for Fidelity CSV imports across options, stocks, and futures. Built with Clean Architecture on the backend and a glassmorphic React SPA on the frontend.

| Property | Value |
|----------|-------|
| Domain | Fintech / Personal Finance |
| Pattern | Clean Architecture (backend) + Feature-based components (frontend) |
| Created | 2026-04-27 |
| Last updated | 2026-04-28 |

---

## Tech Stack

| Tier | Technology | Notes |
|------|-----------|-------|
| Frontend | React 19 + Vite 5 | SPA, glassmorphic light-theme UI |
| Routing | React Router DOM v7 | Client-side routing |
| Charts | Recharts 2 | Equity curve, monthly bar, instrument pie |
| State | React Context + localStorage | Trades persist across page refreshes |
| Backend | Python 3.10 + FastAPI | Async, OpenAPI docs at `/docs` |
| Database | PostgreSQL 16 | Via Docker Compose |
| ORM | SQLAlchemy (async) + Alembic | Migrations in `src/infrastructure/persistence/migrations/` |
| Auth | JWT | Middleware in core layer |
| Infra | Docker + Docker Compose | Single-command startup |
| Testing | pytest + pytest-cov | Coverage reports |

---

## Architecture Layers (Backend)

```
┌─────────────────────────────────────────────────┐
│  Presentation  (FastAPI routers, serialisation)  │
├─────────────────────────────────────────────────┤
│  Application   (Use cases, orchestration)        │
├─────────────────────────────────────────────────┤
│  Domain        (Entities, value objects, ports)  │
├─────────────────────────────────────────────────┤
│  Infrastructure (DB repos, migrations, logging)  │
└─────────────────────────────────────────────────┘
```

| Layer | Description | Forbidden Imports |
|-------|-------------|-------------------|
| `domain` | Pure business logic — no frameworks, no I/O | `fastapi`, `sqlalchemy`, `redis` |
| `application` | Use-case orchestration — calls domain, ports outward | `fastapi`, `sqlalchemy` |
| `infrastructure` | Adapters: DB, HTTP clients, message brokers | — |
| `presentation` | API routes, serialisation, auth middleware | — |

---

## Frontend Structure

```
frontend/src/
├── App.jsx                  # BrowserRouter + layout shell
├── main.jsx                 # React root mount
├── index.css                # Glassmorphic design tokens (CSS variables)
├── context/
│   └── TradesContext.jsx    # Global trade state + CSV import + localStorage
├── utils/
│   └── csvParser.js         # Fidelity CSV parser + FIFO position engine
├── components/
│   ├── Sidebar.jsx          # Navigation sidebar with live net P&L
│   └── StatCard.jsx         # Reusable metric card component
└── pages/
    ├── DashboardPage.jsx    # Equity curve, monthly bar, instrument pie, top symbols
    ├── CalendarPage.jsx     # Daily/monthly P&L heatmap calendar
    ├── TradesPage.jsx       # Filterable trade table + inline tag editor + notes
    ├── OptionsPage.jsx      # Options tracker (avg cost basis, roll chains, FIFO P&L)
    └── ImportPage.jsx       # CSV drag-and-drop upload with format guide
```

---

## Data Flow

```
Fidelity CSV
     │
     ▼
ImportPage (drag-drop)
     │
     ▼
csvParser.js
  ├── parseFidelityCSV()     — parse rows, detect OPTION / STOCK / FUTURE
  ├── computePositions()     — FIFO P&L matching, weighted avg cost, roll detection
  └── aggregateByPeriod()    — daily / weekly / monthly buckets
     │
     ▼
TradesContext (React state + localStorage)
     │
     ├──▶  DashboardPage   (equity curve, monthly bar chart, instrument mix pie)
     ├──▶  CalendarPage    (colour-coded heatmap, monthly summary table)
     ├──▶  TradesPage      (sortable trade list, inline tags, click-to-edit notes)
     └──▶  OptionsPage     (positions by underlying, roll chains, avg entry cost)
```

---

## Folder Structure

```
designatradingjournal/
├── frontend/                   # React SPA (Vite 5)
│   ├── src/                    # App source — see Frontend Structure above
│   ├── dist/                   # Production build output (861 modules, 250 kB gzip)
│   ├── package.json
│   └── vite.config.js          # Custom react-router v7 resolver plugin
├── src/
│   ├── main.py                 # FastAPI app entry point
│   ├── core/                   # Config, DB engine, logging, CORS, auth
│   ├── domain/                 # Pure business logic
│   │   ├── trades/             # Trade entity, TradeType enum
│   │   ├── tags/               # Tag entity
│   │   ├── accounts/           # Account entity
│   │   ├── dashboard/          # DashboardSummary model
│   │   ├── imports/            # TradeHistory (raw CSV row)
│   │   └── shared/             # Result[T,E], error types
│   ├── application/
│   │   ├── repositories/       # Abstract repo interfaces
│   │   └── use_cases/          # Import, PnL, dashboard, tagging
│   ├── infrastructure/
│   │   └── persistence/
│   │       ├── models/         # SQLAlchemy ORM models
│   │       ├── repositories/   # Concrete repo implementations
│   │       └── migrations/     # Alembic migration scripts
│   └── presentation/
│       └── api/routers/        # trades.py, tags_router.py
├── tests/
├── docs/                       # This documentation
├── docker-compose.yml
├── Dockerfile
├── Makefile
├── pyproject.toml
├── alembic.ini
└── run.sh
```

---

## Code Conventions

```
functions     = snake_case
classes       = PascalCase
files         = snake_case
constants     = UPPER_SNAKE_CASE
max_line_len  = 88
errors        = Result[T, E] (Ok / Err)
logging       = structured JSON
docs          = Google-style docstrings
tests         = pytest
api           = REST + OpenAPI
```

---

## Running the Application

```bash
# Option 1 — Docker (recommended)
./run.sh docker

# Option 2 — Local development
make dev-backend          # FastAPI on :8000
cd frontend && npm run dev  # React on :3000 (proxies /api → :8000)

# Option 3 — Frontend standalone (no backend needed)
# CSV parsing and state are fully client-side; trades persist in localStorage
cd frontend && npm run dev
```
