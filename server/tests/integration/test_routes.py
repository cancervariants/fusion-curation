"""Test end-to-end correctness of routes."""
from typing import Dict, Callable
import re

from fastapi.testclient import TestClient
import pytest
from httpx import AsyncClient

from curation.main import app, start_fusor, get_gene_services, get_domain_services


@pytest.fixture(scope="module")
async def client():
    """Provide Starlette client fixture."""
    app.state.fusor = await start_fusor()
    app.state.genes = get_gene_services()
    app.state.domains = get_domain_services()
    return AsyncClient(app=app, base_url="http://test")


def check_fn(response_json: Dict, expected_response: Dict):
    """Provide to check_response to test specific response params"""
    assert ("coordinates_data" in response_json) == (
        "coordinates_data" in expected_response
    )
    if ("coordinates_data" not in response_json) and (
        "coordinates_data" not in expected_response
    ):
        return
    assert response_json["coordinates_data"] == expected_response["coordinates_data"]


async def check_response(
    client: AsyncClient,
    query: str,
    expected_response: Dict,
    data_callback: Callable[[Dict, Dict], None],
):
    """Check that requested URL provides expected response.
    :param AsyncClient client: httpx client
    :param str query: URL endpoint with included query terms
    :param Dict expected_response: structure of correct response
    :param Callable[[Dict, Dict], None] data_callback: function to check correctness
        of non-generic response values (ie, everything outside of `warnings`)
    """
    response = await client.get(query)
    assert response.status_code == 200
    response_json = response.json()
    assert ("warnings" in response_json) == ("warnings" in expected_response)
    if ("warnings" in response_json) and ("warnings" in expected_response):
        assert set(response_json["warnings"]) == set(expected_response["warnings"])
    data_callback(response_json, expected_response)


@pytest.mark.asyncio
async def test_normalize_gene(client: AsyncClient):
    """Test /lookup/gene endpoint"""
    response = await client.get("/lookup/gene?term=NTRK1")
    assert response.status_code == 200
    assert response.json() == {
        "term": "NTRK1",
        "concept_id": "hgnc:8031",
        "symbol": "NTRK1",
    }


# @pytest.mark.asyncio
# async def test_get_genomic_coords(client: AsyncClient):
#     """Test /utilities/get_genomic endpoint"""
#     await check_response(
#         client,
#         "/utilities/get_genomic?"
#     )
#
#
#
#
# @pytest.mark.asyncio
# async def test_get_exon_coords(client: AsyncClient):
#     """Test /utilities/get_exon endpoint"""
#     await check_response(
#         client,
#         "/utilities/get_exon?chromosome=1&start=154192135&strand=-&transcript=NM_152263.3",  # noqa: E501
#         {
#             "coordinates_data": {
#                 "gene": "TPM3",
#                 "chr": "NC_000001.11",
#                 "start": 154192134,
#                 "exon_start": 1,
#                 "exon_start_offset": 0,
#                 "transcript": "NM_152263.3",
#                 "strand": -1,
#             }
#         },
#         check_fn,
#     )
#
#     await check_response(
#         client,
#         "/utilities/get_exon?chromosome=1&start=1&end=10&strand=-&gene=EWSR1",
#         {
#             "warnings": [
#                 "Unable to find a result for chromosome 1 where genomic coordinate 1 is mapped between an exon's start and end coordinates on the negative strand"  # noqa: E501
#             ]
#         },
#         check_fn,
#     )


def test_service_info(client: TestClient):
    """Test /service_info endpoint"""
    response = client.get("/service_info")
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["warnings"] is None
    SEMVER_PATTERN = r"^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)(?:-(?P<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?P<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$"  # noqa: E501
    assert re.match(SEMVER_PATTERN, response_json["version"])
