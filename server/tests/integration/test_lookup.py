"""Test lookup endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_normalize_gene(async_client: AsyncClient):
    """Test /lookup/gene endpoint"""
    response = await async_client.get("/lookup/gene?term=NTRK1")
    assert response.status_code == 200
    assert response.json() == {
        "term": "NTRK1",
        "concept_id": "hgnc:8031",
        "symbol": "NTRK1",
    }
