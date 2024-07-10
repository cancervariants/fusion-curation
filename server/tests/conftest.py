"""Provide core fixtures for testing Flask functions."""
import asyncio
from typing import Callable, Dict

import pytest
from httpx import AsyncClient

from curfu.main import app, get_domain_services, get_gene_services, start_fusor


@pytest.fixture(scope="session")
def event_loop(request):
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def async_client():
    """Provide httpx async client fixture."""
    app.state.fusor = await start_fusor()
    app.state.genes = get_gene_services()
    app.state.domains = get_domain_services()
    client = AsyncClient(app=app, base_url="http://test")
    yield client
    await client.aclose()


response_callback_type = Callable[[Dict, Dict], None]


@pytest.fixture(scope="session")
async def check_response(async_client):
    """Provide base response check function. Use in individual tests."""

    async def check_response(
        query: str,
        expected_response: Dict,
        data_callback: response_callback_type,
        **kwargs
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
        "id": "normalize.gene:hgnc%3A427",
        "type": "GeneDescriptor",
        "label": "ALK",
        "gene_id": "hgnc:427",
    }


@pytest.fixture(scope="module")
def tpm3_descriptor():
    """Gene descriptor for TPM3 gene"""
    return {
        "id": "normalize.gene:TPM3",
        "type": "GeneDescriptor",
        "label": "TPM3",
        "gene_id": "hgnc:12012",
    }


@pytest.fixture(scope="module")
def ntrk1_descriptor():
    """Gene descriptor for NTRK1 gene"""
    return {
        "id": "normalize.gene:NTRK1",
        "type": "GeneDescriptor",
        "label": "NTRK1",
        "gene_id": "hgnc:8031",
    }


@pytest.fixture(scope="module")
def alk_gene_element(alk_descriptor):
    """Provide GeneElement containing ALK gene"""
    return {"type": "GeneElement", "gene_descriptor": alk_descriptor}


@pytest.fixture(scope="module")
def ntrk1_tx_element_start(ntrk1_descriptor):
    """Provide TranscriptSegmentElement for NTRK1 constructed with exon coordinates,
    and only providing starting position.
    """
    return {
        "type": "TranscriptSegmentElement",
        "transcript": "refseq:NM_002529.3",
        "exon_start": 2,
        "exon_start_offset": 1,
        "gene_descriptor": ntrk1_descriptor,
        "element_genomic_start": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "LocationDescriptor",
            "label": "NC_000001.11",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000001.11",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 156864429},
                    "end": {"type": "Number", "value": 156864430},
                },
            },
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
        "exon_start": 6,
        "exon_start_offset": 72,
        "exon_end": 6,
        "exon_end_offset": -5,
        "gene_descriptor": tpm3_descriptor,
        "element_genomic_start": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "LocationDescriptor",
            "label": "NC_000001.11",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000001.11",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 154171416},
                    "end": {"type": "Number", "value": 154171417},
                },
            },
        },
        "element_genomic_end": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "LocationDescriptor",
            "label": "NC_000001.11",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000001.11",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 154171417},
                    "end": {"type": "Number", "value": 154171418},
                },
            },
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
        "exon_start": 6,
        "exon_start_offset": 72,
        "exon_end": 6,
        "exon_end_offset": -5,
        "gene_descriptor": tpm3_descriptor,
        "element_genomic_start": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "LocationDescriptor",
            "label": "NC_000001.11",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000001.11",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 154171416},
                    "end": {"type": "Number", "value": 154171417},
                },
            },
        },
        "element_genomic_end": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "LocationDescriptor",
            "label": "NC_000001.11",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000001.11",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 154171417},
                    "end": {"type": "Number", "value": 154171418},
                },
            },
        },
    }
