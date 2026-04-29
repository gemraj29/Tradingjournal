# DesignATradingjournal — Module Index

_Last updated: 2026-04-28_

---

## Backend modules

### `src/core`
Configuration, database engine, structured logging, CORS, and JWT auth middleware.

| File | Purpose |
|------|---------|
| `config.py` | Pydantic settings — reads `.env`, exposes `settings` singleton |
| `database.py` | Async SQLAlchemy engine + session factory |
| `logging.py` | JSON structured logging via `JsonFormatter` |

---

### `src/domain/trades`
Pure trade business logic — no framework dependencies.

| File | Purpose |
|------|---------|
| `entities.py` | `Trade` dataclass, `TradeType` enum (BUY / SELL / ROLL / EXERCISE) |

---

### `src/domain/tags`
Tag entity for labelling trades with reusable user-defined strings.

| File | Purpose |
|------|---------|
| `entities.py` | `Tag` dataclass |

---

### `src/domain/accounts`
Account entity for tracking which brokerage account each trade belongs to.

| File | Purpose |
|------|---------|
| `entities.py` | `Account` dataclass |

---

### `src/domain/imports`
Raw imported CSV row before normalisation into a `Trade`.

| File | Purpose |
|------|---------|
| `trade_history.py` | `TradeHistory` dataclass |

---

### `src/domain/dashboard`
Aggregated view models for dashboard display.

| File | Purpose |
|------|---------|
| `dashboard_summary.py` | Pydantic `DashboardSummary` — totals, win rate, counts |
| `entities.py` | Domain `DashboardSummary` dataclass (used by application layer) |

---

### `src/domain/shared`
Cross-cutting domain primitives.

| File | Purpose |
|------|---------|
| `result.py` | `Result[T, E]`, `Ok`, `Err` — railway-oriented error handling |
| `errors.py` | `ApplicationError`, `InvalidCsvFormatError`, `NoTradesFoundError`, `TradePersistenceError`, `TradeParsingError` |

---

### `src/application/repositories`
Abstract repository interfaces (ports) — implemented by infrastructure.

| File | Purpose |
|------|---------|
| `trade_repository.py` | `TradeRepository` ABC |
| `tag_repository.py` | `TagRepository` ABC |
| `account_repository.py` | `AccountRepository` ABC |

---

### `src/application/use_cases`
Business workflows — orchestrate domain + call repository ports.

| File | Purpose |
|------|---------|
| `import_fidelity_trades_use_case.py` | Parse Fidelity CSV format (handles preamble, MM/DD/YYYY dates, `YOU BOUGHT` / `YOU SOLD` actions) |
| `import_trades_use_case.py` | Generic CSV import fallback |
| `calculate_pnl_use_case.py` | Per-trade P&L calculation |
| `get_dashboard_summary_use_case.py` | Aggregate trades → `DashboardSummary` |
| `associate_tag_with_trade_use_case.py` | Attach a tag to a trade |

---

### `src/infrastructure/persistence/models`
SQLAlchemy ORM models — database representation.

| File | Purpose |
|------|---------|
| `base.py` / `base_model.py` | Declarative base with `id`, `created_at`, `updated_at` |
| `trade_model.py` | `TradeModel` — maps to `trades` table |
| `tag_model.py` | `TagModel` — maps to `tags` table |
| `account_model.py` | `AccountModel` — maps to `accounts` table |
| `trade_tag_model.py` | `TradeTagModel` — many-to-many join table |

---

### `src/infrastructure/persistence/repositories`
Concrete repository implementations.

| File | Purpose |
|------|---------|
| `in_memory_trade_repository.py` | In-memory `TradeRepository` (used in dev; PostgreSQL impl exists but not yet wired to API routers) |

---

### `src/infrastructure/persistence/migrations`
Alembic migration scripts.

| File | Purpose |
|------|---------|
| `env.py` | Alembic runtime env (async engine config) |
| `versions/initial_migration.py` | Creates `trades`, `tags`, `accounts`, `trade_tags` tables |

---

### `src/presentation/api/routers`
FastAPI route handlers.

| File | Prefix | Endpoints |
|------|--------|-----------|
| `trades.py` | `/trades` | `GET /`, `GET /{id}`, `POST /import` |
| `tags_router.py` | `/tags` | `GET /`, `POST /`, `DELETE /{name}` |

---

## Frontend modules

### `context/TradesContext.jsx`
Global React state for all trade data. Persists to `localStorage`. Exposes: `trades`, `positions`, `summary`, `globalTags`, `importCSV()`, `updateTrade()`, `addTag()`, `removeTag()`, `clearAll()`.

---

### `utils/csvParser.js`
Client-side Fidelity CSV parser and position engine.

| Export | Purpose |
|--------|---------|
| `parseFidelityCSV(text)` | Detects header row, parses rows into `Trade` objects, identifies OPTION / STOCK / FUTURE by symbol pattern |
| `computePositions(trades)` | FIFO lot matching, weighted average cost basis, roll detection, realised P&L × 100 multiplier for options |
| `aggregateByPeriod(trades, period)` | Bucketing by `daily` / `weekly` / `monthly` |

---

### `pages/DashboardPage.jsx`
Equity curve (cumulative P&L area chart), monthly P&L bar chart (green/red per month), instrument mix pie chart, top-8 symbols by trade count, six stat cards.

### `pages/CalendarPage.jsx`
Daily heatmap calendar with intensity-scaled green/red cells. Monthly summary table with win-rate progress bars. Toggle between views.

### `pages/TradesPage.jsx`
Sortable/filterable trade table. Filter by trade type (BUY/SELL/ROLL/EXERCISE), instrument type, symbol search, and tag. Inline tag editor (click `+ tag`). Click-to-edit notes column.

### `pages/OptionsPage.jsx`
Groups option positions by underlying ticker. Shows weighted average entry cost across averaging-down lots, FIFO realised P&L × 100, roll chain history, and expandable trade-leg detail.

### `pages/ImportPage.jsx`
Drag-and-drop CSV upload. Auto-deduplicates on re-import. Shows format guide. Attempts backend sync (`POST /api/trades/import`) but degrades gracefully if backend is offline.

### `components/Sidebar.jsx`
Fixed navigation sidebar. Shows live net P&L at the bottom. Active route highlight via NavLink.

### `components/StatCard.jsx`
Reusable metric card with label, value, optional sub-text, accent colour variant, and icon slot.
