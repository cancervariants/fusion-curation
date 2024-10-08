"""Test end-to-end correctness of constructor routes."""

import pytest


@pytest.mark.asyncio()
async def test_build_gene_element(check_response, alk_gene_element):
    """Test correct functioning of gene element construction route."""

    def check_gene_element_response(
        response: dict, expected_response: dict, expected_id: str = "unset"
    ):
        assert ("element" in response) == ("element" in expected_response)
        if ("element" not in response) and ("element" not in expected_response):
            return
        assert response["element"]["type"] == expected_response["element"]["type"]
        response_gd = response["element"]["gene"]
        expected_gd = expected_response["element"]["gene"]
        assert response_gd["id"] == expected_id
        assert response_gd["type"] == expected_gd["type"]
        assert response_gd["label"] == expected_gd["label"]

    alk_gene_response = {"warnings": [], "element": alk_gene_element}

    await check_response(
        "/api/construct/structural_element/gene?term=hgnc:427",
        alk_gene_response,
        check_gene_element_response,
        expected_id="hgnc:427",
    )
    await check_response(
        "/api/construct/structural_element/gene?term=ALK",
        alk_gene_response,
        check_gene_element_response,
        expected_id="hgnc:427",
    )
    fake_id = "hgnc:99999999"
    await check_response(
        f"/api/construct/structural_element/gene?term={fake_id}",
        {"warnings": [f"gene-normalizer unable to normalize {fake_id}"]},
        check_gene_element_response,
    )


@pytest.fixture(scope="session")
def check_tx_element_response(check_sequence_location):
    """Provide callback function to check correctness of transcript element constructor."""

    def check_tx_element_response(response: dict, expected_response: dict):
        assert ("element" in response) == ("element" in expected_response)
        if ("element" not in response) and ("element" not in expected_response):
            assert "warnings" in response
            assert set(response["warnings"]) == set(expected_response["warnings"])
            return
        response_element = response["element"]
        expected_element = expected_response["element"]
        assert response_element["transcript"] == expected_element["transcript"]
        assert response_element["gene"] == expected_element["gene"]
        assert response_element.get("exonStart") == expected_element.get("exonStart")
        assert response_element.get("exonStartOffset") == expected_element.get(
            "exonStartOffset"
        )
        assert response_element.get("exonEnd") == expected_element.get("exonEnd")
        assert response_element.get("exonEndOffset") == expected_element.get(
            "exonEndOffset"
        )
        genomic_start = response_element.get("elementGenomicStart", {})
        genomic_end = response_element.get("elementGenomicEnd", {})
        expected_genomic_start = expected_element.get("elementGenomicStart", {})
        expected_genomic_end = expected_element.get("elementGenomicEnd", {})
        if genomic_start:
            check_sequence_location(genomic_start, expected_genomic_start)
        if genomic_end:
            check_sequence_location(genomic_end, expected_genomic_end)

    return check_tx_element_response


@pytest.fixture(scope="session")
def check_reg_element_response(check_sequence_location):
    """Provide callback function check correctness of regulatory element constructor."""

    def check_re_response(response: dict, expected_response: dict):
        assert ("regulatoryElement" in response) == (
            "regulatoryElement" in expected_response
        )
        if ("regulatoryElement" not in response) and (
            "regulatoryElement" not in expected_response
        ):
            assert "warnings" in response
            assert set(response["warnings"]) == set(expected_response["warnings"])
            return
        response_re = response["regulatoryElement"]
        expected_re = expected_response["regulatoryElement"]
        assert response_re["type"] == expected_re["type"]
        assert response_re.get("regulatoryClass") == expected_re.get("regulatoryClass")
        assert response_re.get("featureId") == expected_re.get("featureId")
        assert response_re.get("associatedGene") == expected_re.get("associatedGene")
        sequence_location = response_re.get("sequenceLocation")
        expected_sequence_location = expected_re.get("sequenceLocation")
        if sequence_location:
            check_sequence_location(sequence_location, expected_sequence_location)

    return check_re_response


@pytest.fixture(scope="session")
def check_templated_sequence_response(check_sequence_location):
    """Provide callback function to check templated sequence constructor response"""

    def check_temp_seq_response(response: dict, expected_response: dict):
        assert ("element" in response) == ("element" in expected_response)
        if ("element" not in response) and ("element" not in expected_response):
            assert "warnings" in response
            assert set(response["warnings"]) == set(expected_response["warnings"])
            return
        response_elem = response["element"]
        expected_elem = expected_response["element"]
        assert response_elem["type"] == expected_elem["type"]
        assert response_elem["strand"] == expected_elem["strand"]
        assert response_elem["region"]["id"] == expected_elem["region"]["id"]
        check_sequence_location(response_elem["region"] or {}, expected_elem["region"])
        assert response_elem["region"]["start"] == expected_elem["region"]["start"]
        assert response_elem["region"]["end"] == expected_elem["region"]["end"]

    return check_temp_seq_response


@pytest.mark.asyncio()
async def test_build_tx_segment_ec(
    check_response, check_tx_element_response, ntrk1_tx_element_start
):
    """Test correct functioning of transcript segment element construction using exon
    coordinates and transcript.
    """
    await check_response(
        "/api/construct/structural_element/tx_segment_ec?transcript=NM_002529.3&exon_start=2&exon_start_offset=1",
        {"element": ntrk1_tx_element_start},
        check_tx_element_response,
    )

    # test require exonStart or exonEnd
    await check_response(
        "/api/construct/structural_element/tx_segment_ec?transcript=NM_002529.3",
        {"warnings": ["Must provide either `exon_start` or `exon_end`"]},
        check_tx_element_response,
    )

    # test handle invalid transcript
    await check_response(
        "/api/construct/structural_element/tx_segment_ec?transcript=NM_0012529.3&exon_start=3",
        {"warnings": ["No exons found given NM_0012529.3"]},
        check_tx_element_response,
    )


@pytest.mark.asyncio()
async def test_build_segment_gc(
    check_response, check_tx_element_response, tpm3_tx_g_element, tpm3_tx_t_element
):
    """Test correct functioning of transcript segment element construction using
    genomic coordinates and gene name.
    """
    await check_response(
        "/api/construct/structural_element/tx_segment_gc?gene=TPM3&chromosome=NC_000001.11&start=154171416&end=154171417",
        {"element": tpm3_tx_g_element},
        check_tx_element_response,
    )

    """Test correct functioning of transcript segment element construction using
    genomic coordinates and transcript.
    """
    await check_response(
        "/api/construct/structural_element/tx_segment_gc?transcript=NM_152263.4&chromosome=NC_000001.11&start=154171416&end=154171417",
        {"element": tpm3_tx_t_element},
        check_tx_element_response,
    )


@pytest.mark.asyncio()
async def test_build_reg_element(check_response, check_reg_element_response):
    """Test correctness of regulatory element constructor endpoint."""
    await check_response(
        "/api/construct/regulatory_element?element_class=promoter&gene_name=braf",
        {
            "regulatoryElement": {
                "associatedGene": {
                    "id": "hgnc:1097",
                    "label": "BRAF",
                    "type": "Gene",
                },
                "regulatoryClass": "promoter",
                "type": "RegulatoryElement",
            }
        },
        check_reg_element_response,
    )


@pytest.mark.asyncio()
async def test_build_templated_sequence(
    check_response, check_templated_sequence_response
):
    """Test correct functioning of templated sequence constructor"""
    expected = {
        "element": {
            "type": "TemplatedSequenceElement",
            "region": {
                "id": "ga4gh:SL._4tPimZ9AFATsAr2TKp-6VDZMNcQnIf8",
                "type": "SequenceLocation",
                "sequenceReference": {
                    "id": "refseq:NC_000001.11",
                    "refgetAccession": "",
                    "type": "SequenceReference",
                },
                "start": 154171415,
                "end": 154171417,
            },
            "strand": -1,
        },
    }
    await check_response(
        "/api/construct/structural_element/templated_sequence?start=154171415&end=154171417&sequence_id=NC_000001.11&strand=-",
        expected,
        check_templated_sequence_response,
    )

    await check_response(
        "/api/construct/structural_element/templated_sequence?start=154171415&end=154171417&sequence_id=refseq%3ANC_000001.11&strand=-",
        expected,
        check_templated_sequence_response,
    )
