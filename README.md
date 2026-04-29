# DesignATradingJournal

A personal trading journal for Fidelity accounts — track options, stocks, and futures with a glassmorphic light-theme UI. Import your Fidelity CSV export and instantly see P&L, equity curves, calendar heatmaps, option position chains, and trade tags.

![Dashboard](docs/screenshots/dashboard.png)

---

## Features

- **CSV Import** — drag-and-drop Fidelity trade history CSV; client-side parsing with deduplication across multiple imports
- **Dashboard** — net P&L, win rate, equity curve, monthly bar chart, instrument mix, top symbols
- **Calendar View** — daily heatmap with intensity-scaled profit/loss cells; monthly summary table
- **Options Tracker** — weighted average cost basis across averaging-down buys; FIFO lot P&L; roll chain detection
- **Trades Table** — sortable/filterable table with inline tag editor and click-to-edit notes
- **Glassmorphic UI** — light theme with `backdrop-filter` glass cards, soft gradients, and a consistent design system
- **Offline-first** — all data stored in `localStorage`; works without the backend running
- **FastAPI backend** — optional REST API with PostgreSQL persistence for multi-device use

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 5, React Router v7, Recharts 2 |
| State | React Context + `localStorage` |
| Backend | FastAPI (Python 3.10+), SQLAlchemy async, Alembic |
| Database | PostgreSQL 16 (Docker) |
| Architecture | Clean Architecture — Domain → Application → Infrastructure → Presentation |

---

## Quick Start

### Frontend only (no Docker needed)

```bash
# Install dependencies
cd frontend
npm install

# Start dev server on localhost:3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to **Import**, and upload your Fidelity CSV.

### Full stack (with backend + PostgreSQL)

```bash
# Start PostgreSQL + backend
make dev-backend        # uvicorn on :8000

# In another terminal
make dev-frontend       # vite on :3000
```

Or with Docker:

```bash
docker compose up --build
```

---

## Importing Your Fidelity CSV

1. Log in to Fidelity → **Accounts & Trade → Activity & Orders**
2. Select date range → **Download** → choose **CSV**
3. In the app go to **Import** → drag and drop the file

The parser handles:
- `YOU BOUGHT` / `YOU SOLD` action strings
- OCC option symbols (`AAPL 250117C00200000`)
- Futures (`/ES`, `/NQ`, `/MES`, etc.)
- Fractional shares
- Multiple CSV files (deduplication by date + symbol + qty + price)

---

## P&L Calculation

P&L uses **FIFO lot matching** with Fidelity's `Amount ($)` field (which includes commissions and the options 100× multiplier automatically):

- **Realized P&L** — matched when a SELL/ROLL closes an open lot
- **Options** — `Amount ($)` already reflects the full contract value; no separate multiplier needed
- **Rolls** — detected as SELL trades with `tradeType === 'ROLL'`; shown as separate legs in the Options tracker
- **Weighted average cost** — recalculated after each BUY into an open position

---

## Project Structure

```
designatradingjournal/
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── pages/              # DashboardPage, CalendarPage, TradesPage, OptionsPage, ImportPage
│   │   ├── components/         # StatCard, Sidebar, shared UI
│   │   ├── context/            # TradesContext (global state + localStorage)
│   │   ├── utils/
│   │   │   └── csvParser.js    # parseFidelityCSV(), computePositions(), aggregateByPeriod()
│   │   └── index.css           # Glassmorphic design tokens
│   └── vite.config.js          # Dev server + react-router v7 CJS fix
├── src/                        # FastAPI backend (Clean Architecture)
│   ├── domain/                 # Entities, value objects (no external deps)
│   ├── application/            # Use cases + repository interfaces
│   ├── infrastructure/         # SQLAlchemy ORM, Alembic migrations, repositories
│   └── presentation/           # FastAPI routers
├── docs/
│   ├── ARCHITECTURE.md
│   ├── MODULES.md
│   ├── API.md
│   ├── DECISIONS.md            # Architecture Decision Records (ADRs)
│   ├── CHANGELOG.md
│   └── flowcharts/             # Mermaid diagrams
├── Makefile
├── docker-compose.yml
└── pyproject.toml
```

---

## Makefile Targets

```bash
make dev-backend        # uvicorn src.main:app --reload --port 8000
make dev-frontend       # cd frontend && npm run dev
make install-frontend   # cd frontend && npm install
make build-frontend     # cd frontend && npm run build
```

---

## Backend API

The FastAPI backend exposes three routers (all prefixed with no path prefix — proxied via `/api` in dev):

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/trades/import` | Upload Fidelity CSV and persist trades |
| `GET`  | `/trades/` | List all trades |
| `GET`  | `/trades/{id}` | Get single trade |
| `GET`  | `/dashboard/summary` | Aggregated P&L stats |
| `GET`  | `/tags/` | List all tags |
| `POST` | `/tags/` | Create tag |
| `POST` | `/tags/{trade_id}` | Associate tag with trade |

Full request/response examples in [`docs/API.md`](docs/API.md).

---

## Architecture Decisions

See [`docs/DECISIONS.md`](docs/DECISIONS.md) for the full ADR log. Key decisions:

- **ADR-004** — React SPA with client-side CSV parsing; works offline without PostgreSQL
- **ADR-005** — React Context over Redux; simple flat trade list doesn't need extra overhead
- **ADR-006** — FIFO lot matching using Fidelity `Amount ($)` for accurate P&L including commissions
- **ADR-007** — Custom Vite plugin to resolve react-router v7 CJS incompatibility with Vite 5

---

## Development Notes

### Why `node node_modules/vite/bin/vite.js` instead of `vite`?

The `vite` global isn't required. npm scripts invoke the local binary directly for reproducibility.

### react-router v7 + Vite 5 compatibility

Vite 5's `@rollup/plugin-commonjs` can't resolve react-router v7's ESM-only `exports` map. A two-line custom plugin in `vite.config.js` (`reactRouterV7Fix`) intercepts the bare specifiers and points them at the CJS dist files. See ADR-007.

### localStorage vs PostgreSQL

By default all trade data lives in `localStorage` under `tj_trades_v1`. The Vite proxy (`/api → :8000`) transparently connects to the FastAPI backend when it's running — the frontend degrades gracefully when it isn't. PostgreSQL persistence is the natural next upgrade.

---

## License

MIT
