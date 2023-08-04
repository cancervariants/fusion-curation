"""Test lookup endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_normalize_gene(async_client: AsyncClient):
    """Test /complete/gene endpoint"""
    response = await async_client.get("/api/complete/gene?term=NTRK")
    assert response.status_code == 200
    assert response.json() == {
        "term": "NTRK",
        "matches_count": 4,
        "concept_id": [],
        "symbol": [
            ["NTRK1", "NTRK1", "hgnc:8031", "NCBI:NC_000001.11", "+"],
            ["NTRK2", "NTRK2", "hgnc:8032", "NCBI:NC_000009.12", "+"],
            ["NTRK3", "NTRK3", "hgnc:8033", "NCBI:NC_000015.10", "-"],
            ["NTRK3-AS1", "NTRK3-AS1", "hgnc:27532", "NCBI:NC_000015.10", "+"],
        ],
        "prev_symbols": [],
        "aliases": [],
    }

    response = await async_client.get("/api/complete/gene?term=a")
    assert response.status_code == 200
    assert response.json() == {
        "warnings": [
            "Exceeds max matches: Got 2096 possible matches for a (limit: 50)"
        ],
        "term": "a",
        "matches_count": 2096,
        "concept_id": [],
        "symbol": [],
        "prev_symbols": [
            ["A", "LOC100420587", "ncbigene:100420587", "NCBI:NC_000019.10", "-"]
        ],
        "aliases": [
            ["A", "LOC110467529", "ncbigene:110467529", "NCBI:NC_000021.9", "+"]
        ],
    }
