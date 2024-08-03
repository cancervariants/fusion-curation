"""Test /nomenclature/ endpoints."""

import pytest
from fusor.examples import bcr_abl1
from httpx import AsyncClient


@pytest.fixture(scope="module")
def regulatory_element():
    """Provide regulatory element fixture."""
    return {
        "regulatoryClass": "promoter",
        "associatedGene": {"id": "hgnc:9339", "label": "G1", "type": "Gene"},
    }


@pytest.fixture(scope="module")
def epcam_5_prime():
    """Provide EPCAM transcript segment element for 5' end of a fusion."""
    return {
        "type": "TranscriptSegmentElement",
        "transcript": "refseq:NM_002354.2",
        "exonEnd": 5,
        "exonEndOffset": 0,
        "gene": {
            "type": "Gene",
            "label": "EPCAM",
            "id": "hgnc:11529",
        },
        "elementGenomicEnd": {
            "id": "fusor.location_descriptor:NC_000002.12",
            "type": "SequenceLocation",
            "label": "NC_000002.12",
            "location": {
                "type": "SequenceLocation",
                "start": 47377013,
                "end": 47377014,
            },
        },
    }


@pytest.fixture(scope="module")
def epcam_3_prime():
    """Provide EPCAM transcript segment element for 3' end of a fusion."""
    return {
        "type": "TranscriptSegmentElement",
        "transcript": "refseq:NM_002354.2",
        "exonStart": 5,
        "exonStartOffset": 0,
        "gene": {
            "type": "Gene",
            "label": "EPCAM",
            "id": "hgnc:11529",
        },
        "elementGenomicStart": {
            "id": "fusor.location_descriptor:NC_000002.12",
            "type": "SequenceLocation",
            "start": 47377013,
            "end": 47377014,
        },
    }


@pytest.fixture(scope="module")
def epcam_invalid():
    """Provide invalidly-constructed EPCAM transcript segment element."""
    return {
        "type": "TranscriptSegmentElement",
        "exonEnd": 5,
        "exonEndOffset": 0,
        "gene": {
            "type": "Gene",
            "label": "EPCAM",
            "id": "hgnc:11529",
        },
        "elementGenomicEnd": {
            "id": "fusor.location_descriptor:NC_000002.12",
            "type": "SequenceLocation",
            "start": 47377013,
            "end": 47377014,
        },
    }


@pytest.fixture(scope="module")
def templated_sequence_element():
    """Provide templated sequence element fixture."""
    return {
        "type": "TemplatedSequenceElement",
        "strand": "-",
        "region": {
            "id": "ga4gh:SL.sKl255JONKva_LKJeyfkmlmqXTaqHcWq",
            "type": "SequenceLocation",
            "sequenceReference": {
                "id": "refseq:NC_000001.11",
                "refgetAccession": "SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
                "type": "SequenceReference",
            },
            "start": 15455,
            "end": 15566,
        },
    }


@pytest.mark.asyncio()
async def test_regulatory_element_nomenclature(
    async_client: AsyncClient, regulatory_element: dict
):
    """Test correctness of regulatory element nomenclature endpoint."""
    response = await async_client.post(
        "api/nomenclature/regulatory_element", json=regulatory_element
    )
    assert response.status_code == 200
    assert response.json().get("nomenclature", "") == "reg_p@G1(hgnc:9339)"


@pytest.mark.asyncio()
async def test_tx_segment_nomenclature(
    async_client: AsyncClient,
    ntrk1_tx_element_start: dict,
    epcam_5_prime: dict,
    epcam_3_prime: dict,
    epcam_invalid: dict,
):
    """Test correctness of transcript segment nomenclature response."""
    response = await async_client.post(
        "/api/nomenclature/transcript_segment?first=false&last=true",
        json=ntrk1_tx_element_start,
    )
    assert response.status_code == 200
    assert response.json().get("nomenclature", "") == "NM_002529.3(NTRK1):e.2+1"

    response = await async_client.post(
        "/api/nomenclature/transcript_segment?first=true&last=false", json=epcam_5_prime
    )
    assert response.status_code == 200
    assert response.json().get("nomenclature", "") == "NM_002354.2(EPCAM):e.5"

    response = await async_client.post(
        "/api/nomenclature/transcript_segment?first=false&last=true", json=epcam_3_prime
    )
    assert response.status_code == 200
    assert response.json().get("nomenclature", "") == "NM_002354.2(EPCAM):e.5"

    response = await async_client.post(
        "/api/nomenclature/transcript_segment?first=true&last=false", json=epcam_invalid
    )
    assert response.status_code == 200
    expected_warnings = [
        "validation error for TranscriptSegmentElement",
        "Field required",
    ]
    for expected in expected_warnings:
        assert expected in response.json().get("warnings", [])[0]


@pytest.mark.asyncio()
async def test_gene_element_nomenclature(
    async_client: AsyncClient, alk_gene_element: dict
):
    """Test correctness of gene element nomenclature endpoint."""
    response = await async_client.post("/api/nomenclature/gene", json=alk_gene_element)
    assert response.status_code == 200
    assert response.json().get("nomenclature", "") == "ALK(hgnc:427)"

    response = await async_client.post(
        "/api/nomenclature/gene",
        json={"type": "GeneElement", "associatedGene": {"id": "hgnc:427"}},
    )
    assert response.status_code == 200
    expected_warnings = ["validation error for GeneElement", "Field required"]
    for expected in expected_warnings:
        assert expected in response.json().get("warnings", [])[0]


@pytest.mark.asyncio()
async def test_templated_sequence_nomenclature(
    async_client: AsyncClient, templated_sequence_element: dict
):
    """Test correctness of templated sequence element endpoint."""
    response = await async_client.post(
        "/api/nomenclature/templated_sequence", json=templated_sequence_element
    )
    assert response.status_code == 200
    assert (
        response.json().get("nomenclature", "")
        == "NC_000001.11(chr 1):g.15455_15566(-)"
    )

    response = await async_client.post(
        "/api/nomenclature/templated_sequence",
        json={
            "type": "TemplatedSequenceElement",
            "region": {
                "id": "NC_000001.11:15455-15566",
                "type": "SequenceLocation",
                "start": 15455,
                "end": 15566,
            },
        },
    )
    assert response.status_code == 200
    expected_warnings = [
        "validation error for TemplatedSequenceElement",
        "Input should be a valid integer",
    ]
    for expected in expected_warnings:
        assert expected in response.json().get("warnings", [])[0]


@pytest.mark.asyncio()
async def test_fusion_nomenclature(async_client: AsyncClient):
    """Test correctness of fusion nomneclature endpoint."""
    bcr_abl1_formatted = bcr_abl1.model_dump()
    bcr_abl1_json = {
        "structure": bcr_abl1_formatted.get("structure"),
        "fusion_type": "CategoricalFusion",
        "reading_frame_preserved": True,
        "regulatory_element": None,
        "critical_functional_domains": bcr_abl1_formatted.get(
            "criticalFunctionalDomains"
        ),
    }
    response = await async_client.post(
        "/api/nomenclature/fusion?skip_vaidation=true", json=bcr_abl1_json
    )
    assert response.status_code == 200
    assert (
        response.json().get("nomenclature", "")
        == "NM_004327.3(BCR):e.2+182::ACTAAAGCG::NM_005157.5(ABL1):e.2-173"
    )
