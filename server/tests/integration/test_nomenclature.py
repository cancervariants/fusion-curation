"""Test /nomenclature/ endpoints."""
from typing import Dict

import pytest
from httpx import AsyncClient
from fusor.examples import bcr_abl1


@pytest.fixture(scope="module")
def regulatory_element():
    """Provide regulatory element fixture."""
    return {
        "regulatory_class": "promoter",
        "associated_gene": {
            "id": "gene:G1",
            "gene": {"gene_id": "hgnc:9339"},
            "label": "G1",
        },
    }


@pytest.fixture(scope="module")
def epcam_5_prime():
    """Provide EPCAM transcript segment element for 5' end of a fusion."""
    return {
        "type": "TranscriptSegmentElement",
        "transcript": "refseq:NM_002354.2",
        "exon_end": 5,
        "exon_end_offset": 0,
        "gene_descriptor": {
            "id": "normalize.gene:EPCAM",
            "type": "GeneDescriptor",
            "label": "EPCAM",
            "gene_id": "hgnc:11529",
        },
        "element_genomic_end": {
            "id": "fusor.location_descriptor:NC_000002.12",
            "type": "LocationDescriptor",
            "label": "NC_000002.12",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000002.12",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 47377013},
                    "end": {"type": "Number", "value": 47377014},
                },
            },
        },
    }


@pytest.fixture(scope="module")
def epcam_3_prime():
    """Provide EPCAM transcript segment element for 3' end of a fusion."""
    return {
        "type": "TranscriptSegmentElement",
        "transcript": "refseq:NM_002354.2",
        "exon_start": 5,
        "exon_start_offset": 0,
        "gene_descriptor": {
            "id": "normalize.gene:EPCAM",
            "type": "GeneDescriptor",
            "label": "EPCAM",
            "gene_id": "hgnc:11529",
        },
        "element_genomic_start": {
            "id": "fusor.location_descriptor:NC_000002.12",
            "type": "LocationDescriptor",
            "label": "NC_000002.12",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000002.12",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 47377013},
                    "end": {"type": "Number", "value": 47377014},
                },
            },
        },
    }


@pytest.fixture(scope="module")
def epcam_invalid():
    """Provide invalidly-constructed EPCAM transcript segment element."""
    return {
        "type": "TranscriptSegmentElement",
        "exon_end": 5,
        "exon_end_offset": 0,
        "gene_descriptor": {
            "id": "normalize.gene:EPCAM",
            "type": "GeneDescriptor",
            "label": "EPCAM",
            "gene_id": "hgnc:11529",
        },
        "element_genomic_end": {
            "id": "fusor.location_descriptor:NC_000002.12",
            "type": "LocationDescriptor",
            "label": "NC_000002.12",
            "location": {
                "type": "SequenceLocation",
                "sequence_id": "refseq:NC_000002.12",
                "interval": {
                    "type": "SequenceInterval",
                    "start": {"type": "Number", "value": 47377013},
                    "end": {"type": "Number", "value": 47377014},
                },
            },
        },
    }


@pytest.fixture(scope="module")
def templated_sequence_element():
    """Provide templated sequence element fixture."""
    return {
        "type": "TemplatedSequenceElement",
        "strand": "-",
        "region": {
            "id": "NC_000001.11:15455-15566",
            "type": "LocationDescriptor",
            "location": {
                "sequence_id": "refseq:NC_000001.11",
                "interval": {
                    "start": {"type": "Number", "value": 15455},
                    "end": {"type": "Number", "value": 15566},
                },
                "type": "SequenceLocation",
            },
            "label": "NC_000001.11:15455-15566",
        },
    }


@pytest.mark.asyncio
async def test_regulatory_element_nomenclature(
    async_client: AsyncClient, regulatory_element: Dict
):
    """Test correctness of regulatory element nomenclature endpoint."""
    response = await async_client.post(
        "api/nomenclature/regulatory_element", json=regulatory_element
    )
    assert response.status_code == 200
    assert response.json().get("nomenclature", "") == "reg_p@G1(hgnc:9339)"


@pytest.mark.asyncio
async def test_tx_segment_nomenclature(
    async_client: AsyncClient,
    ntrk1_tx_element_start: Dict,
    epcam_5_prime: Dict,
    epcam_3_prime: Dict,
    epcam_invalid: Dict,
):
    """Test correctness of transcript segment nomenclature response."""
    response = await async_client.post(
        "/api/nomenclature/transcript_segment?first=false&last=true",
        json=ntrk1_tx_element_start,
    )
    assert response.status_code == 200
    assert response.json().get("nomenclature", "") == "refseq:NM_002529.3(NTRK1):e.2+1"

    response = await async_client.post(
        "/api/nomenclature/transcript_segment?first=true&last=false", json=epcam_5_prime
    )
    assert response.status_code == 200
    assert response.json().get("nomenclature", "") == "refseq:NM_002354.2(EPCAM):e.5"

    response = await async_client.post(
        "/api/nomenclature/transcript_segment?first=false&last=true", json=epcam_3_prime
    )
    assert response.status_code == 200
    assert response.json().get("nomenclature", "") == "refseq:NM_002354.2(EPCAM):e.5"

    response = await async_client.post(
        "/api/nomenclature/transcript_segment?first=true&last=false", json=epcam_invalid
    )
    assert response.status_code == 200
    assert response.json().get("warnings", []) == [
        "1 validation error for TranscriptSegmentElement\ntranscript\n  field required (type=value_error.missing)"  # noqa: E501
    ]


@pytest.mark.asyncio
async def test_gene_element_nomenclature(
    async_client: AsyncClient, alk_gene_element: Dict
):
    """Test correctness of gene element nomenclature endpoint."""
    response = await async_client.post("/api/nomenclature/gene", json=alk_gene_element)
    assert response.status_code == 200
    assert response.json().get("nomenclature", "") == "ALK(hgnc:427)"

    response = await async_client.post(
        "/api/nomenclature/gene",
        json={"type": "GeneElement", "associated_gene": {"id": "hgnc:427"}},
    )
    assert response.status_code == 200
    assert response.json().get("warnings", []) == [
        "2 validation errors for GeneElement\ngene_descriptor\n  field required (type=value_error.missing)\nassociated_gene\n  extra fields not permitted (type=value_error.extra)"  # noqa: E501
    ]


@pytest.mark.asyncio
async def test_templated_sequence_nomenclature(
    async_client: AsyncClient, templated_sequence_element: Dict
):
    """Test correctness of templated sequence element endpoint."""
    response = await async_client.post(
        "/api/nomenclature/templated_sequence", json=templated_sequence_element
    )
    assert response.status_code == 200
    assert (
        response.json().get("nomenclature", "")
        == "refseq:NC_000001.11(chr 1):g.15455_15566(-)"
    )

    response = await async_client.post(
        "/api/nomenclature/templated_sequence",
        json={
            "type": "TemplatedSequenceElement",
            "region": {
                "id": "NC_000001.11:15455-15566",
                "type": "LocationDescriptor",
                "location": {
                    "interval": {
                        "start": {"type": "Number", "value": 15455},
                        "end": {"type": "Number", "value": 15566},
                    },
                    "sequence_id": "refseq:NC_000001.11",
                    "type": "SequenceLocation",
                },
            },
        },
    )
    assert response.status_code == 200
    assert response.json().get("warnings", []) == [
        "1 validation error for TemplatedSequenceElement\nstrand\n  field required (type=value_error.missing)"  # noqa: E501
    ]


@pytest.mark.asyncio
async def test_fusion_nomenclature(async_client: AsyncClient):
    """Test correctness of fusion nomneclature endpoint."""
    response = await async_client.post("/api/nomenclature/fusion", json=bcr_abl1.dict())
    assert response.status_code == 200
    assert (
        response.json().get("nomenclature", "")
        == "refseq:NM_004327.3(BCR):e.2+182::ACTAAAGCG::refseq:NM_005157.5(ABL1):e.2-173"
    )
