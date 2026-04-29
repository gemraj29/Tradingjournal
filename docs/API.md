# DesignATradingjournal — API Reference

Base URL: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs` (dev mode only)  
Auth: `Bearer <token>` (JWT)

_Last updated: 2026-04-28_

---

## Trades

### `GET /trades/`
Returns all trades in the active repository.

**Response 200**
```json
{
  "trades": [
    {
      "id": "uuid",
      "symbol": "AAPL",
      "trade_type": "BUY",
      "quantity": 10,
      "price": "175.50",
      "trade_date": "2024-03-27",
      "account_id": "default",
      "profit_loss": "0.00",
      "notes": null,
      "tags": []
    }
  ]
}
```

---

### `GET /trades/{trade_id}`
Returns a single trade by ID.

**Path params**
| Param | Type | Description |
|-------|------|-------------|
| `trade_id` | string (UUID) | Trade identifier |

**Response 200**
```json
{ "message": "Details for trade <trade_id>" }
```

---

### `POST /trades/import`
Import trades from a CSV file. Tries Fidelity format first, falls back to generic CSV.

**Request** — `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | `.csv` file (Fidelity export or generic format) |

**Fidelity CSV format expected:**
```
Run Date,Action,Symbol,Description,Type,Quantity,Price,Amount
03/27/2024,YOU BOUGHT,AAPL,APPLE INC,Cash,10,175.50,-1755.00
03/26/2024,YOU SOLD,TSLA,TESLA INC,Cash,5,182.10,910.50
03/25/2024,YOU BOUGHT,AAPL240315C00175000,CALL OPT,Options,1,3.50,-350.00
```

**Response 201** (success)
```json
{ "message": "Successfully imported 42 trades" }
```

**Response 200** (parse error)
```json
{ "error": "Could not find Fidelity CSV header row." }
```

---

## Tags

### `GET /tags/`
Returns all available tags.

**Response 200**
```json
["example_tag_1", "example_tag_2"]
```

---

### `POST /tags/`
Creates a new tag.

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `tag_name` | string | Name of tag to create |

**Response 200**
```json
"Tag 'averaging-down' created successfully."
```

---

### `DELETE /tags/{tag_name}`
Deletes a tag by name.

**Path params**
| Param | Type | Description |
|-------|------|-------------|
| `tag_name` | string | Tag to delete |

**Response 200**
```json
"Tag 'averaging-down' deleted successfully."
```

---

## Frontend proxy

The React dev server (`localhost:3000`) proxies all `/api/*` requests to `localhost:8000`, stripping the `/api` prefix.

| Frontend call | Backend target |
|---------------|---------------|
| `POST /api/trades/import` | `POST http://localhost:8000/trades/import` |
| `GET /api/trades/` | `GET http://localhost:8000/trades/` |
| `GET /api/tags/` | `GET http://localhost:8000/tags/` |

---

## Notes on current implementation

- The API currently uses an **in-memory repository** (`InMemoryTradeRepository`). Data is lost on server restart.
- The frontend stores trades in `localStorage` as a workaround — the React app is fully functional without the backend running.
- PostgreSQL repository implementations exist in `src/infrastructure/persistence/repositories/` and are ready to be wired up.
- Dashboard and tag endpoints are placeholder stubs; full implementations are in the application use cases.
