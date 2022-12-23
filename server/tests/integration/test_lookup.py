"""Test lookup endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_normalize_gene(async_client: AsyncClient):
    """Test /api/lookup/gene endpoint"""
    response = await async_client.get("/api/lookup/gene?term=NTRK1")
    assert response.status_code == 200
    assert response.json() == {
        "term": "NTRK1",
        "concept_id": "hgnc:8031",
        "symbol": "NTRK1",
        "cased": "NTRK1",
    }

    response = await async_client.get("/api/lookup/gene?term=ntrk1")
    assert response.status_code == 200
    assert response.json() == {
        "term": "ntrk1",
        "concept_id": "hgnc:8031",
        "symbol": "NTRK1",
        "cased": "NTRK1",
    }

    response = await async_client.get("/api/lookup/gene?term=acee")
    assert response.status_code == 200
    assert response.json() == {
        "term": "acee",
        "concept_id": "hgnc:108",
        "symbol": "ACHE",
        "cased": "ACEE",
    }

    response = await async_client.get("/api/lookup/gene?term=c9ORF72")
    assert response.status_code == 200
    assert response.json() == {
        "term": "c9ORF72",
        "concept_id": "hgnc:28337",
        "symbol": "C9orf72",
        "cased": "C9orf72",
    }

    response = await async_client.get("/api/lookup/gene?term=sdfliuwer")
    assert response.status_code == 200
    assert response.json() == {
        "term": "sdfliuwer",
        "warnings": ["Lookup of gene term sdfliuwer failed."],
    }
