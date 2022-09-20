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
        "symbols": [
            ["NTRK1", "hgnc:8031", "NTRK1"],
            ["NTRK2", "hgnc:8032", "NTRK2"],
            ["NTRK3", "hgnc:8033", "NTRK3"],
            ["NTRK3-AS1", "hgnc:27532", "NTRK3-AS1"],
        ],
        "prev_symbols": [
            ["NTRK4", "hgnc:2730", "DDR1"],
            ["NTRKR1", "hgnc:10256", "ROR1"],
            ["NTRKR2", "hgnc:10257", "ROR2"],
            ["NTRKR3", "hgnc:2731", "DDR2"],
        ],
        "aliases": [
            ["NTRK4", "hgnc:2730", "DDR1"],
            ["NTRKR1", "hgnc:10256", "ROR1"],
            ["NTRKR2", "hgnc:10257", "ROR2"],
            ["NTRKR3", "hgnc:2731", "DDR2"],
        ],
    }

    response = await async_client.get("/complete/gene?term=a")
    assert response.status_code == 200
    assert response.json() == {
        "term": "a",
        "warnings": [
            "Exceeds max matches: Got 6605 possible matches for a (limit: 50)"
        ],
    }
