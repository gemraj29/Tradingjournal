# DesignATradingjournal — Architecture Decision Records

## ADR-001: Backend — FastAPI

**Status:** Accepted
**Date:** 2026-04-27

### Context
The project needs a backend API framework for domain `general`.

### Decision
FastAPI

### Rationale
FastAPI provides automatic OpenAPI docs, async-first design, Pydantic validation, and Python type safety. Ideal for high-performance APIs.

### Consequences
- Developers must follow the conventions defined in the DNA
- All API endpoints must be documented with OpenAPI schemas

---
## ADR-002: Database — PostgreSQL

**Status:** Accepted
**Date:** 2026-04-27

### Context
The project requires a primary data store.

### Decision
PostgreSQL

### Rationale
PostgreSQL provides ACID compliance, rich JSON support, excellent performance, and the broadest feature set of any open-source RDBMS.
