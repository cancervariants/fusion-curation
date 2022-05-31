"""Test lookup endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_normalize_gene(async_client: AsyncClient):
    """Test /complete/gene endpoint"""
    response = await async_client.get("/complete/gene?term=NTRK")
    assert response.status_code == 200
    assert response.json() == {
        "term": "NTRK",
        "suggestions": [
            ["", "hgnc:27532", "NTRK3-AS1", "symbol"],
            ["", "hgnc:8033", "NTRK3", "symbol"],
            ["", "hgnc:8032", "NTRK2", "symbol"],
            ["", "hgnc:8031", "NTRK1", "symbol"],
            ["NTRK4", "hgnc:2730", "DDR1", "alias"],
            ["NTRKR1", "hgnc:10256", "ROR1", "alias"],
            ["NTRKR3", "hgnc:2731", "DDR2", "alias"],
            ["NTRKR2", "hgnc:10257", "ROR2", "alias"],
            ["NTRK4", "hgnc:2730", "DDR1", "prev_symbol"],
            ["NTRKR1", "hgnc:10256", "ROR1", "prev_symbol"],
            ["NTRKR3", "hgnc:2731", "DDR2", "prev_symbol"],
            ["NTRKR2", "hgnc:10257", "ROR2", "prev_symbol"],
        ],
    }
