"""Provide core fixtures for testing Flask functions."""

import asyncio
from collections.abc import Callable

import pytest
import pytest_asyncio
from curfu.main import app, get_domain_services, get_gene_services, start_fusor
from httpx import AsyncClient


@pytest.fixture(scope="session")
def event_loop(request):
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def async_client():
    """Provide httpx async client fixture."""
    app.state.fusor = await start_fusor()
    app.state.genes = get_gene_services()
    app.state.domains = get_domain_services()
    client = AsyncClient(app=app, base_url="http://test")
    yield client
    await client.aclose()


response_callback_type = Callable[[dict, dict], None]


@pytest_asyncio.fixture(scope="session")
async def check_response(async_client):
    """Provide base response check function. Use in individual tests."""

    async def check_response(
        query: str,
        expected_response: dict,
        data_callback: response_callback_type,
        **kwargs,
    ):
        """Check that requested URL provides expected response.
        :param str query: URL endpoint with included query terms
        :param Dict expected_response: structure of correct response
        :param Callable[[Dict, Dict], None] data_callback: function to check correctness
            of non-generic response values (ie, everything outside of `warnings`)
        :param kwargs: any callback-specific arguments needed
        """
        response = await async_client.get(query)
        assert response.status_code == 200
        response_json = response.json()
        assert bool(response_json.get("warnings")) == bool(
            expected_response.get("warnings")
        )
        if bool(response_json.get("warnings")) and bool(
            expected_response.get("warnings")
        ):
            assert set(response_json["warnings"]) == set(expected_response["warnings"])
        data_callback(response_json, expected_response, **kwargs)

    return check_response


@pytest.fixture(scope="module")
def alk_descriptor():
    """Gene descriptor for ALK gene"""
    return {
        "type": "Gene",
        "label": "ALK",
        "id": "hgnc:427",
    }


@pytest.fixture(scope="module")
def tpm3_descriptor():
    """Gene descriptor for TPM3 gene"""
    return {
        "type": "Gene",
        "label": "TPM3",
        "id": "hgnc:12012",
    }


@pytest.fixture(scope="module")
def ntrk1_descriptor():
    """Gene descriptor for NTRK1 gene"""
    return {
        "type": "Gene",
        "label": "NTRK1",
        "id": "hgnc:8031",
    }


@pytest.fixture(scope="module")
def alk_gene_element(alk_descriptor):
    """Provide GeneElement containing ALK gene"""
    return {"type": "GeneElement", "gene": alk_descriptor}


@pytest.fixture(scope="module")
def ntrk1_tx_element_start(ntrk1_descriptor):
    """Provide TranscriptSegmentElement for NTRK1 constructed with exon coordinates,
    and only providing starting position.
    """
    return {
        "type": "TranscriptSegmentElement",
        "transcript": "refseq:NM_002529.3",
        "exonStart": 2,
        "exonStartOffset": 1,
        "gene": ntrk1_descriptor,
        "elementGenomicStart": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "SequenceLocation",
            "start": 156864429,
            "end": 156864430,
        },
    }


@pytest.fixture(scope="module")
def tpm3_tx_t_element(tpm3_descriptor):
    """Provide TranscriptSegmentElement for TPM3 gene constructed using genomic coordinates
    and transcript.
    """
    return {
        "type": "TranscriptSegmentElement",
        "transcript": "refseq:NM_152263.4",
        "exonStart": 6,
        "exonStartOffset": 72,
        "exonEnd": 6,
        "exonEndOffset": -5,
        "gene": tpm3_descriptor,
        "elementGenomicStart": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "SequenceLocation",
            "start": 154171416,
            "end": 154171417,
        },
        "elementGenomicEnd": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "SequenceLocation",
            "start": 154171417,
            "end": 154171418,
        },
    }


@pytest.fixture(scope="module")
def tpm3_tx_g_element(tpm3_descriptor):
    """Provide TranscriptSegmentElement for TPM3 gene constructed using genomic coordinates and
    gene name.
    """
    return {
        "type": "TranscriptSegmentElement",
        "transcript": "refseq:NM_152263.4",
        "exonStart": 6,
        "exonStartOffset": 5,
        "exonEnd": 6,
        "exonEndOffset": -70,
        "gene": tpm3_descriptor,
        "elementGenomicStart": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "SequenceLocation",
            "start": 154171483,
            "end": 154171484,
        },
        "elementGenomicEnd": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "SequenceLocation",
            "start": 154171482,
            "end": 154171483,
        },
    }
