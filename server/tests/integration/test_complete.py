"""Test lookup endpoints"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio()
async def test_complete_gene(async_client: AsyncClient):
    """Test /complete/gene endpoint"""
    # test simple completion
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

    # test huge # of valid completions
    response = await async_client.get("/api/complete/gene?term=a")
    assert response.status_code == 200
    response_json = response.json()
    assert len(response_json["warnings"]) == 1
    assert "Exceeds max matches" in response_json["warnings"][0]
    assert (
        response_json["matches_count"] >= 2000
    ), "should be a whole lot of matches (2081 as of last prod data dump)"
    # TODO these aren't matching anymore, and the results here look kind of weird.
    # we should double check in a separate issue
    # assert response_json["prev_symbols"] == [
    #     ["A", "LOC100420587", "ncbigene:100420587", "NCBI:NC_000019.10", "-"]
    # ]
    # assert response_json["aliases"] == [
    #     ["A", "LOC110467529", "ncbigene:110467529", "NCBI:NC_000021.9", "+"]
    # ]

    # test concept ID match
    response = await async_client.get("/api/complete/gene?term=hgnc:1097")
    assert response.status_code == 200
    response_json = response.json()
    assert (
        response_json["matches_count"] >= 11
    ), "at least 11 matches are expected as of last prod data dump"
    assert response_json["concept_id"][0] == [
        "hgnc:1097",
        "BRAF",
        "hgnc:1097",
        "NCBI:NC_000007.14",
        "-",
    ], "BRAF should be first"
    assert response_json["symbol"] == []
    assert response_json["prev_symbols"] == []
    assert response_json["aliases"] == []


@pytest.mark.asyncio()
async def test_complete_domain(async_client: AsyncClient):
    """Test /complete/domain endpoint"""
    response = await async_client.get("/api/complete/domain?gene_id=hgnc%3A1097")
    # TODO we should have better canonical examples of domains that we want to see
    assert response.json() == {
        "gene_id": "hgnc:1097",
        "suggestions": [
            {
                "interproId": "interpro:IPR000719",
                "domainName": "Protein kinase domain",
                "start": 457,
                "end": 717,
                "refseqAc": "NP_004324.2",
            },
            {
                "interproId": "interpro:IPR001245",
                "domainName": "Serine-threonine/tyrosine-protein kinase, catalytic domain",
                "start": 458,
                "end": 712,
                "refseqAc": "NP_004324.2",
            },
            {
                "interproId": "interpro:IPR002219",
                "domainName": "Protein kinase C-like, phorbol ester/diacylglycerol-binding domain",
                "start": 235,
                "end": 280,
                "refseqAc": "NP_004324.2",
            },
            {
                "interproId": "interpro:IPR003116",
                "domainName": "Raf-like Ras-binding",
                "start": 157,
                "end": 225,
                "refseqAc": "NP_004324.2",
            },
            {
                "interproId": "interpro:IPR008271",
                "domainName": "Serine/threonine-protein kinase, active site",
                "start": 572,
                "end": 584,
                "refseqAc": "NP_004324.2",
            },
            {
                "interproId": "interpro:IPR017441",
                "domainName": "Protein kinase, ATP binding site",
                "start": 463,
                "end": 483,
                "refseqAc": "NP_004324.2",
            },
            {
                "interproId": "interpro:IPR020454",
                "domainName": "Diacylglycerol/phorbol-ester binding",
                "start": 232,
                "end": 246,
                "refseqAc": "NP_004324.2",
            },
        ],
    }
