# DesignATradingjournal — Architecture Decision Records

_Last updated: 2026-04-28_

---

## ADR-001: Backend framework — FastAPI

**Status:** Accepted  
**Date:** 2026-04-27

### Context
The project needs a backend API framework.

### Decision
FastAPI (Python 3.10+)

### Rationale
FastAPI provides automatic OpenAPI docs, async-first design, Pydantic validation, and Python type safety. Ideal for high-performance APIs with minimal boilerplate.

### Consequences
- All endpoints must be documented with OpenAPI schemas
- Async patterns (`async def`) required throughout
- Pydantic models used for request/response validation

---

## ADR-002: Database — PostgreSQL

**Status:** Accepted  
**Date:** 2026-04-27

### Context
The project requires a persistent data store for trades, tags, and accounts.

### Decision
PostgreSQL 16 via Docker Compose

### Rationale
PostgreSQL provides ACID compliance, rich JSON support, excellent performance, and broad ecosystem support (SQLAlchemy async driver, Alembic migrations).

### Consequences
- Docker required for local development
- Alembic manages all schema changes; no manual DDL
- SQLAlchemy async engine used throughout infrastructure layer

---

## ADR-003: Error handling — Result type

**Status:** Accepted  
**Date:** 2026-04-27

### Context
The project needs a consistent error-handling approach across use cases and repositories.

### Decision
Railway-oriented `Result[T, E]` pattern with `Ok` and `Err` variants (`src/domain/shared/result.py`)

### Rationale
Avoids unchecked exceptions propagating across layer boundaries. Makes error states explicit and composable. Inspired by Rust's `Result` type.

### Consequences
- All use cases return `Result[T, ApplicationError]`
- Callers must handle both `Ok` and `Err` branches
- No bare `raise` in application or domain layers

---

## ADR-004: Frontend — React SPA (client-side only)

**Status:** Accepted  
**Date:** 2026-04-28

### Context
The original backend was built API-first. A UI was needed that could work even without the backend running (useful for personal use without Docker).

### Decision
React 19 SPA with Vite 5, fully client-side CSV parsing, and `localStorage` persistence.

### Rationale
- All Fidelity CSV parsing happens in the browser — no backend round-trip needed for the core workflow
- `localStorage` makes trades survive page refreshes without PostgreSQL
- Vite's proxy (`/api → :8000`) means the frontend connects to the backend transparently when it is running
- Zero server-side rendering needed for a personal trading journal

### Consequences
- Data is browser-local by default; multi-device sync requires backend integration
- In-memory repository in the backend is sufficient for current CSV-upload workflow
- Production PostgreSQL persistence is the obvious next upgrade

---

## ADR-005: Frontend state management — React Context (no Redux)

**Status:** Accepted  
**Date:** 2026-04-28

### Context
The app needs shared trade state across 5 pages.

### Decision
Single `TradesContext` with `useReducer`-style state, exposed via a custom `useTrades()` hook.

### Rationale
The data model is simple (flat trade list + derived positions). Redux adds overhead without benefit at this scale. Context with `useMemo` for derived data is sufficient.

### Consequences
- All derived values (`positions`, `summary`) are memoised with `useMemo`
- Heavy computations (`computePositions`) run only when `trades` array changes
- If the app grows to thousands of trades, consider moving to Zustand or a worker thread

---

## ADR-006: Option P&L tracking — FIFO lot matching

**Status:** Accepted  
**Date:** 2026-04-28

### Context
Users average into options positions (buy more contracts at lower prices) and roll positions near expiry. The app must report the true entry cost for the full position chain.

### Decision
FIFO (first-in, first-out) lot matching in `csvParser.js::computePositions()`. Rolls are detected as SELL trades with `tradeType === 'ROLL'`.

### Rationale
FIFO matches the IRS default accounting method and is the most common approach among retail traders. Weighted average cost is displayed separately for the full averaging chain.

### Consequences
- P&L per closed lot is calculated against the oldest open lot's cost basis
- Weighted average entry is the total cost of open lots divided by open quantity
- Rolls show as a separate leg in the position chain detail view

---

## ADR-007: Vite 5 + react-router v7 compatibility shim

**Status:** Accepted  
**Date:** 2026-04-28

### Context
Vite 5's `@rollup/plugin-commonjs` resolver cannot resolve `react-router` v7's conditional `exports` map (no `require` condition). Vite 8 uses native Rolldown which crashes in the Linux sandbox.

### Decision
Custom Vite plugin `reactRouterV7Fix()` in `vite.config.js` that intercepts `react-router` and `react-router/dom` bare specifiers and resolves them to their CJS dist files directly.

### Rationale
Minimal invasive fix — two lines of `resolveId`. No forking or patching of dependencies. Should be removable once Vite 5 or react-router ships a fix.

### Consequences
- Must be updated if react-router changes its `dist/development/` path structure
- Can be removed when upgrading to a Vite version that handles the exports map natively
