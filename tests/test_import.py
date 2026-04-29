"""Tests for the /trades/import endpoint using a minimal Fidelity-format CSV."""

import pytest
from httpx import AsyncClient

# Minimal Fidelity CSV with the column names the parser expects
FIDELITY_CSV = (
    "brokerage\n"
    "Run Date,Account,Action,Symbol,Security Description,Security Type,"
    "Exchange,Quantity,Currency,Price ($),Exchange Rate,Commission ($),"
    "Fees ($),Accrued Interest ($),Amount ($),Settlement Date\n"
    "12/01/2024,BrokerageLink,YOU BOUGHT APPLE INC (AAPL) (Cash),AAPL,"
    "APPLE INC,Cash,NASDAQ,10,,150.00,,0.00,0.00,,-1500.00,12/03/2024\n"
    "12/15/2024,BrokerageLink,YOU SOLD APPLE INC (AAPL) (Cash),AAPL,"
    "APPLE INC,Cash,NASDAQ,10,,160.00,,0.00,0.65,,1599.35,12/17/2024\n"
)


@pytest.mark.asyncio
async def test_import_trades(client: AsyncClient):
    files = {"file": ("fidelity.csv", FIDELITY_CSV, "text/csv")}
    resp = await client.post("/trades/import", files=files)
    assert resp.status_code in (200, 201)


@pytest.mark.asyncio
async def test_get_trades_returns_list(client: AsyncClient):
    resp = await client.get("/trades/")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, (list, dict))


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
