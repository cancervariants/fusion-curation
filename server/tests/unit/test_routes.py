"""Test client-facing routes."""
import pytest
from fastapi.testclient import TestClient

from curation.routes import app


@pytest.fixture(scope="function")
def testclient():
    """FastAPI client instance to provide to each test function."""
    with TestClient(app) as test_client:
        yield test_client


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
def alk_gene_component(alk_descriptor):
    """GeneComponent containing ALK gene"""
    return {"component_type": "gene", "gene_descriptor": alk_descriptor}


@pytest.fixture(scope="module")
def ntrk1_tx_component_start(ntrk1_descriptor):
    """TranscriptSegmentComponent for NTRK1 constructed with exon coordinates,
    and only providing starting position.
    """
    return {
        "component_type": "transcript_segment",
        "transcript": "refseq:NM_002529.3",
        "exon_start": 2,
        "exon_start_offset": 1,
        "gene_descriptor": ntrk1_descriptor,
        "component_genomic_start": {
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
def tpm3_tx_t_component(tpm3_descriptor):
    """TranscriptSegmentComponent for TPM3 gene constructed using genomic coordinates
    and transcript.
    """
    return {
        "component_type": "transcript_segment",
        "transcript": "refseq:NM_152263.4",
        "exon_start": 6,
        "exon_start_offset": 76,
        "exon_end": 6,
        "exon_end_offset": -3,
        "gene_descriptor": tpm3_descriptor,
        "component_genomic_start": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "LocationDescriptor",
            "label": "NC_000001.11",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000001.11",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 154171412},
                    "end": {"type": "Number", "value": 154171413},
                },
            },
        },
        "component_genomic_end": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "LocationDescriptor",
            "label": "NC_000001.11",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000001.11",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 154171414},
                    "end": {"type": "Number", "value": 154171415},
                },
            },
        },
    }


@pytest.fixture(scope="module")
def tpm3_tx_g_component(tpm3_descriptor):
    """TranscriptSegmentComponent for TPM3 gene constructed using genomic coordinates
    and gene name.
    """
    return {
        "component_type": "transcript_segment",
        "transcript": "refseq:NM_152263.4",
        "exon_start": 7,
        "exon_start_offset": 62,
        "exon_end": 6,
        "exon_end_offset": -74,
        "gene_descriptor": tpm3_descriptor,
        "component_genomic_start": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "LocationDescriptor",
            "label": "NC_000001.11",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000001.11",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 154170649},
                    "end": {"type": "Number", "value": 154170650},
                },
            },
        },
        "component_genomic_end": {
            "id": "fusor.location_descriptor:NC_000001.11",
            "type": "LocationDescriptor",
            "label": "NC_000001.11",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000001.11",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 154171485},
                    "end": {"type": "Number", "value": 154171486},
                },
            },
        },
    }


def test_build_gene_component(testclient, alk_gene_component):
    """Test correct functioning of gene component construction route.
    :param Testclient testclient: client fixture to use to retrieve requests
    :param Dict alk_gene_component: ALK gene component fixture
    """
    alk_id = "hgnc:427"
    response = testclient.get(f"/component/gene?term={alk_id}")
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["warnings"] == []
    assert response_data["component"] == alk_gene_component

    fake_id = "hgnc:99999999"
    response = testclient.get(f"/component/gene?term={fake_id}")
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["warnings"] == [
        f"gene-normalizer unable to normalize {fake_id}"
    ]
    assert "component" not in response_data


def test_build_tx_segment_ect(testclient, ntrk1_tx_component_start):
    """Test correct functioning of transcript segment component construction using exon
    coordinates and transcript.
    :param Testclient testclient: client fixture to use to retrieve requests
    :param Dict ntrk1_tx_component_start: NTRK1 transcript segment component fixture
    """
    url = (
        "/component/tx_segment_ect?transcript=NM_002529.3"
        "&exon_start=2&exon_start_offset=1"
    )
    response = testclient.get(url)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data.get("warnings") is None
    assert response_data["component"] == ntrk1_tx_component_start

    # test require exon_start or exon_end
    url = "/component/tx_segment_ect?transcript=NM_002529.3"
    response = testclient.get(url)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data.get("warnings") == [
        "Must provide either `exon_start` or `exon_end`"
    ]
    assert response_data.get("component") is None

    # test handle invalid transcript
    url = "/component/tx_segment_ect?transcript=NM_0012529.3&exon_start=3"
    response = testclient.get(url)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data.get("warnings") == ["Unable to get exons for NM_0012529.3"]
    assert response_data.get("component") is None


def test_build_segment_gct(testclient, tpm3_tx_t_component):
    """Test correct functioning of transcript segment component construction using
    genomic coordinates and transcript.
    :param Testclient testclient: client fixture to use to retrieve requests
    :param Dict ntrk1_tx_t_component: NTRK1 transcript segment component fixture
    """
    url = (
        "component/tx_segment_gct?transcript=NM_152263.4&chromosome=NC_000001.11"
        "&start=154171413&end=154171415&strand=-"
    )
    response = testclient.get(url)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data.get("warnings") is None
    assert response_data.get("component") == tpm3_tx_t_component


def test_build_segment_gcg(testclient, tpm3_tx_g_component):
    """Test correct functioning of transcript segment component construction using
    genomic coordinates and gene name.
    :param Testclient testclient: client fixture to use to retrieve requests
    :param Dict ntrk1_tx_g_component: NTRK1 transcript segment component fixture
    """
    url = (
        "component/tx_segment_gcg?gene=TPM3&chromosome=NC_000001.11"
        "&start=154171413&end=154171415&strand=-"
    )
    response = testclient.get(url)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data.get("warnings") is None
    assert response_data.get("component") == tpm3_tx_g_component
