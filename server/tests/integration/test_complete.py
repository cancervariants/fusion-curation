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

    response = await async_client.get("/api/complete/gene?term=hgnc:1097")
    assert response.status_code == 200
    assert response.json() == {
        "term": "hgnc:1097",
        "matches_count": 11,
        "concept_id": [
            ["hgnc:1097", "BRAF", "hgnc:1097", "NCBI:NC_000007.14", "-"],
            ["hgnc:10970", "SLC22A6", "hgnc:10970", "NCBI:NC_000011.10", "-"],
            ["hgnc:10971", "SLC22A7", "hgnc:10971", "NCBI:NC_000006.12", "+"],
            ["hgnc:10972", "SLC22A8", "hgnc:10972", "NCBI:NC_000011.10", "-"],
            ["hgnc:10973", "SLC23A2", "hgnc:10973", "NCBI:NC_000020.11", "-"],
            ["hgnc:10974", "SLC23A1", "hgnc:10974", "NCBI:NC_000005.10", "-"],
            ["hgnc:10975", "SLC24A1", "hgnc:10975", "NCBI:NC_000015.10", "+"],
            ["hgnc:10976", "SLC24A2", "hgnc:10976", "NCBI:NC_000009.12", "-"],
            ["hgnc:10977", "SLC24A3", "hgnc:10977", "NCBI:NC_000020.11", "+"],
            ["hgnc:10978", "SLC24A4", "hgnc:10978", "NCBI:NC_000014.9", "+"],
            ["hgnc:10979", "SLC25A1", "hgnc:10979", "NCBI:NC_000022.11", "-"],
        ],
        "symbol": [],
        "prev_symbols": [],
        "aliases": [],
    }
