"""Test end-to-end correctness of routes."""
from typing import Dict, Callable

import pytest
from httpx import AsyncClient


response_callback_type = Callable[[Dict, Dict], None]


async def check_response(
    async_client: AsyncClient,
    query: str,
    expected_response: Dict,
    data_callback: response_callback_type,
):
    """Check that requested URL provides expected response.
    :param AsyncClient client: httpx client
    :param str query: URL endpoint with included query terms
    :param Dict expected_response: structure of correct response
    :param Callable[[Dict, Dict], None] data_callback: function to check correctness
        of non-generic response values (ie, everything outside of `warnings`)
    """
    response = await async_client.get(query)
    assert response.status_code == 200
    response_json = response.json()
    assert ("warnings" in response_json) == ("warnings" in expected_response)
    if ("warnings" in response_json) and ("warnings" in expected_response):
        assert set(response_json["warnings"]) == set(expected_response["warnings"])
    data_callback(response_json, expected_response)


def check_coords_response(response_json: Dict, expected_response: Dict):
    """Provide to check_response to test specific response params"""
    assert ("coordinates_data" in response_json) == (
        "coordinates_data" in expected_response
    )
    if ("coordinates_data" not in response_json) and (
        "coordinates_data" not in expected_response
    ):
        return
    assert response_json["coordinates_data"] == expected_response["coordinates_data"]


@pytest.mark.asyncio
async def test_get_exon_coords(async_client: AsyncClient):
    """Test /utilities/get_exon endpoint"""
    await check_response(
        async_client,
        "/utilities/get_exon?chromosome=1",
        {
            "warnings": [
                "Must provide start and/or end coordinates",
                "Must provide gene and/or transcript",
            ]
        },
        check_coords_response,
    )

    await check_response(
        async_client,
        "/utilities/get_exon?chromosome=NC_000001.11&start=154192131&gene=TPM3",
        {
            "warnings": [
                "Unable to find mane data for NC_000001.11 with position 154192132 on gene TPM3"  # noqa: E501
            ]
        },
        check_coords_response,
    )

    await check_response(
        async_client,
        "/utilities/get_exon?chromosome=1&transcript=NM_152263.3&start=154192135&strand=-",  # noqa: E501
        {
            "coordinates_data": {
                "gene": "TPM3",
                "chr": "NC_000001.11",
                "start": 154192134,
                "exon_start": 1,
                "exon_start_offset": 0,
                "transcript": "NM_152263.3",
                "strand": -1,
            }
        },
        check_coords_response,
    )
