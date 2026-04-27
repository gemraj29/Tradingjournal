# DesignATradingjournal — Architecture

## Overview

**Design a Tradingjournal app which can load my fidelity trade history on options stocks futures and generate dashboard.I tend to have daily monthly weekly calenderview with profits and number of trades. While trading I tend to loose price when averaging options and close to expire I roll and due to average cost of option and rolling I don’t know which price I bought it . I should be able to track this in the app. I want to know overall how much I earned in trading and how much money I lost and add personal tags to trades so I don’t repeat same mistakes for now it will load csv files and create this.Use glassmorphics beautiful ui design with light theme **

| Property | Value |
|----------|-------|
| Domain | general |
| Pattern | Clean Architecture |
| Feature-based | Yes |
| Created | 2026-04-27 |

## Tech Stack

| Tier | Technology |
|------|-----------|
| Language | Python |
| Backend | FastAPI |
| Database | PostgreSQL |
| Infra | Docker + Docker Compose |
| Testing | pytest |
| Auth | JWT |

## Code Conventions

```
CONVENTIONS:
  functions=snake_case  classes=PascalCase
  files=snake_case  constants=UPPER_SNAKE_CASE
  errors=result_type  logging=structured
  docs=google  tests=pytest
  line_len<=88
```

## Architecture Layers

| Layer | Description | Forbidden Imports |
|-------|-------------|-------------------|
| `domain` | Pure business logic — no frameworks, no I/O | `fastapi, sqlalchemy, redis` |
| `application` | Use-case orchestration — calls domain, ports outward | `fastapi, sqlalchemy` |
| `infrastructure` | Adapters: DB, HTTP clients, message brokers | `—` |
| `presentation` | API routes, serialisation, auth middleware | `—` |

## Folder Structure

```
designatradingjournal/
├── .codedna/                    # Agent state (DNA, context cards, checkpoints)
│   ├── dna.json                 # Project identity — single source of truth
│   ├── context/                 # Module context cards (~200 tokens each)
│   ├── tasks/                   # Task DAG and plan
│   └── checkpoints/             # Resume points
├── src/
│   ├── core/                    # Shared config, DB, logging, auth middleware
│   └── features/                # Vertical feature slices
│       ├── <feature>/
│       │   ├── domain/          # Pure business logic — no framework imports
│       │   ├── application/     # Use-case orchestration
│       │   ├── infrastructure/  # DB repos, HTTP clients, adapters
│       │   └── presentation/    # API routes, serialisation
├── tests/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── MODULES.md
│   ├── API.md
│   ├── DECISIONS.md
│   └── flowcharts/              # Mermaid diagrams (auto-generated)
├── docker-compose.yml
├── Makefile
└── CODEDNA.md                   # Project summary + resume instructions
```

## Design Principles

1. **DNA-first** — All identity lives in `.codedna/dna.json`, never in LLM memory
2. **Context cards** — Modules are known by their ~200-token card; full source only when editing
3. **Atomic tasks** — Every unit of work ≤ 500 LOC, always checkpointed
4. **Quality gates** — Naming, import rules, size limits enforced before every file write
5. **Git as truth** — Every task = conventional commit; history is the audit trail
