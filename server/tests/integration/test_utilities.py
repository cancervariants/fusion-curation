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


def check_coords_response(response: Dict, expected_response: Dict):
    """Provide to check_response to test specific response params"""
    assert ("coordinates_data" in response) == ("coordinates_data" in expected_response)
    if ("coordinates_data" not in response) and (
        "coordinates_data" not in expected_response
    ):
        return
    assert response["coordinates_data"] == expected_response["coordinates_data"]


def check_sequence_id_response(response: Dict, expected_response: Dict):
    """Provide to check_response to test specific response params"""
    assert response["sequence"] == expected_response["sequence"]
    if response.get("ga4gh_sequence_id") or expected_response.get("ga4gh_sequence_id"):
        assert response["ga4gh_sequence_id"] == expected_response["ga4gh_sequence_id"]
    if response.get("aliases") or expected_response.get("aliases"):
        assert set(response["aliases"]) == set(expected_response["aliases"])


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


@pytest.mark.asyncio
async def test_get_sequence_id(async_client: AsyncClient):
    """Test sequence ID lookup utility endpoint"""
    await check_response(
        async_client,
        "/utilities/get_sequence_id?sequence_id=NC_000001.11",
        {
            "sequence": "NC_000001.11",
            "ga4gh_sequence_id": "ga4gh:SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
            "aliases": [
                "GRCh38.p6:chr1",
                "GRCh38:chr1",
                "GRCh38.p2:1",
                "GRCh38.p10:1",
                "MD5:6aef897c3d6ff0c78aff06ac189178dd",
                "GRCh38.p4:chr1",
                "GRCh38.p10:chr1",
                "GRCh38.p7:1",
                "GRCh38.p8:chr1",
                "sha512t24u:Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
                "GRCh38.p3:1",
                "GRCh38.p8:1",
                "GRCh38.p2:chr1",
                "GRCh38.p12:1",
                "GRCh38.p5:1",
                "GRCh38.p1:chr1",
                "GRCh38.p11:1",
                "GRCh38.p12:chr1",
                "GRCh38.p6:1",
                "SEGUID:FCUd6VJ6uikS/VWLbhGdVmj2rOA",
                "GRCh38.p9:chr1",
                "GRCh38.p1:1",
                "NCBI:NC_000001.11",
                "GRCh38.p11:chr1",
                "VMC:GS_Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
                "refseq:NC_000001.11",
                "GRCh38.p9:1",
                "GRCh38:1",
                "ga4gh:SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
                "SHA1:14251de9527aba2912fd558b6e119d5668f6ace0",
                "GRCh38.p5:chr1",
                "GRCh38.p7:chr1",
                "GRCh38.p3:chr1",
                "GRCh38.p4:1",
            ],
        },
        check_sequence_id_response,
    )

    await check_response(
        async_client,
        "/utilities/get_sequence_id?sequence_id=NP_001278445.11",
        {
            "sequence_id": "NP_001278445.11",
            "warnings": "Identifier NP_001278445.11 could not be retrieved",
        },
        check_sequence_id_response,
    )
