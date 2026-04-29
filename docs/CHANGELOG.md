# DesignATradingjournal — Changelog

_Last updated: 2026-04-28_

---

## [Unreleased] — 2026-04-28

### Added
- React 19 + Vite 5 frontend with glassmorphic light-theme UI
- `DashboardPage` — equity curve, monthly bar chart, instrument mix pie, top symbols, 6 stat cards
- `CalendarPage` — daily heatmap with intensity-scaled P&L cells; monthly summary table
- `TradesPage` — sortable/filterable trade table with inline tag editor and click-to-edit notes
- `OptionsPage` — options position tracker: weighted avg cost basis, FIFO P&L, roll chain detection
- `ImportPage` — drag-and-drop Fidelity CSV upload with format guide and deduplication
- `csvParser.js` — client-side Fidelity CSV parser; detects OPTION / STOCK / FUTURE by symbol pattern
- `computePositions()` — FIFO lot matching, weighted average cost tracking, roll detection
- `TradesContext` — global React state with `localStorage` persistence
- Vite proxy config: `/api/*` → `localhost:8000`
- `make dev-frontend` and `make dev-backend` Makefile targets

---

## [0.1.0] — 2026-04-27

### Added (from git history)

| Commit | Change |
|--------|--------|
| `3f8f60f` | fix: alembic async engine, SQLAlchemy URL driver, dashboard impl |
| `0ee20c5` | fix: resolve all import errors and runtime issues |
| `2729d36` | Updated usage guide and run.sh shell script |
| `6c2d7e7` | Initial project commit |
| `a68f369` | feat: register all API routers with main FastAPI app |
| `ee93524` | feat: create FastAPI router for tag operations |
| `c06d1ed` | feat: create FastAPI router for dashboard data |
| `740f9b5` | feat: create FastAPI router for trade operations |
| `7725817` | feat: implement logic to tag a trade with existing or new tags |
| `a4e02a9` | feat: implement basic dashboard aggregation logic |
| `ec439b9` | feat: implement basic PnL calculation for trades |
| `92ed6ec` | feat: implement basic CSV import logic for trades |
| `4a69ffa` | feat: generate and apply first Alembic migration for core tables |
| `9acf84a` | feat: implement AccountRepository using SQLAlchemy for PostgreSQL |
| `49ab153` | feat: implement TradeRepository using SQLAlchemy for PostgreSQL |
| `ea2c80c` | feat: create SQLAlchemy ORM model for TradeTag association |
| `ab41fa0` | feat: create SQLAlchemy ORM model for Account entity |
| `94b23a2` | feat: define interface for importing trade data from CSV |
| `4315f89` | feat: define interface for associating tags with trades |
| `3fc0776` | feat: define interface for calculating trade PnL |
| `a284bd5` | feat: implement TagRepository using SQLAlchemy for PostgreSQL |
| `9e3f3c6` | feat: create SQLAlchemy ORM model for Tag entity |
| `621901f` | feat: create SQLAlchemy ORM model for Trade entity |
| `8c99875` | feat: define interface for retrieving dashboard summary data |
| `a4b0933` | feat: define abstract interface for Account persistence |
| `15ac305` | feat: define abstract interface for Tag persistence |
| `e4fa8b4` | feat: define TradeTag association for many-to-many relationships |
| `7f4edce` | feat: define abstract interface for Trade persistence |
| `cf2ef12` | feat: create base SQLAlchemy ORM model with common features |
| `1d2e469` | feat: initialize Alembic for database migrations |
| `d8e6941` | feat: create GitHub Actions workflow for CI |
| `aaabf0e` | feat: define DashboardSummary for aggregated dashboard views |
| `d080675` | feat: define TradeHistory for raw imported trade data |
| `363ae3f` | feat: define Account entity for tracking trading accounts |
| `0e67b12` | feat: define Tag entity for categorizing trades |
| `aecea8f` | feat: define Trade entity with core attributes |
| `c765c97` | feat: define database connection settings and SQLAlchemy engine |
| `837bf0f` | feat: add black, isort, flake8 to pre-commit configuration |
| `7718ae7` | feat: configure pytest for unit and integration tests |
| `fef756c` | feat: define base Result type for consistent error handling |
| `b6bc1ab` | feat: implement structured logging configuration |
| `a871f8f` | feat: create main FastAPI application instance and entry point |
| `8794184` | feat: set up Dockerfile and docker-compose.yml for app + DB |
| `f1520cb` | feat: create base project directories and pyproject.toml |
| `aad1f6d` | chore: initial CodeDNA scaffold |
