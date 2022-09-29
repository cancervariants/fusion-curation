"""Test end-to-end correctness of constructor routes."""
from typing import Dict

import pytest


@pytest.mark.asyncio
async def test_build_gene_element(check_response, alk_gene_element):
    """Test correct functioning of gene element construction route."""

    def check_gene_element_response(
        response: Dict, expected_response: Dict, expected_id: str = "unset"
    ):
        assert ("element" in response) == ("element" in expected_response)
        if ("element" not in response) and ("element" not in expected_response):
            return
        assert response["element"]["type"] == expected_response["element"]["type"]
        response_gd = response["element"]["gene_descriptor"]
        expected_gd = expected_response["element"]["gene_descriptor"]
        assert response_gd["id"] == expected_id
        assert response_gd["type"] == expected_gd["type"]
        assert response_gd["label"] == expected_gd["label"]
        assert response_gd["gene_id"] == expected_gd["gene_id"]

    alk_gene_response = {"warnings": [], "element": alk_gene_element}

    await check_response(
        "/construct/structural_element/gene?term=hgnc:427",
        alk_gene_response,
        check_gene_element_response,
        expected_id="normalize.gene:hgnc%3A427",
    )
    await check_response(
        "/construct/structural_element/gene?term=ALK",
        alk_gene_response,
        check_gene_element_response,
        expected_id="normalize.gene:ALK",
    )
    fake_id = "hgnc:99999999"
    await check_response(
        f"/construct/structural_element/gene?term={fake_id}",
        {"warnings": [f"gene-normalizer unable to normalize {fake_id}"]},
        check_gene_element_response,
    )


@pytest.fixture(scope="module")
def check_tx_element_response():
    """Provide callback function to check correctness of transcript element constructor."""

    def check_tx_element_response(response: Dict, expected_response: Dict):
        assert ("element" in response) == ("element" in expected_response)
        if ("element" not in response) and ("element" not in expected_response):
            assert "warnings" in response
            assert set(response["warnings"]) == set(expected_response["warnings"])
            return
        response_element = response["element"]
        expected_element = expected_response["element"]
        assert response_element["transcript"] == expected_element["transcript"]
        assert (
            response_element["gene_descriptor"] == expected_element["gene_descriptor"]
        )
        assert response_element.get("exon_start") == expected_element.get("exon_start")
        assert response_element.get("exon_start_offset") == expected_element.get(
            "exon_start_offset"
        )
        assert response_element.get("exon_end") == expected_element.get("exon_end")
        assert response_element.get("exon_end_offset") == expected_element.get(
            "exon_end_offset"
        )
        assert response_element.get("element_genomic_start") == expected_element.get(
            "element_genomic_start"
        )
        assert response_element.get("element_genomic_end") == expected_element.get(
            "element_genomic_end"
        )

    return check_tx_element_response


@pytest.fixture(scope="module")
def check_reg_element_response():
    """Provide callback function check correctness of regulatory element constructor."""

    def check_re_response(response: Dict, expected_response: Dict):
        assert ("regulatory_element" in response) == (
            "regulatory_element" in expected_response
        )
        if ("regulatory_element" not in response) and (
            "regulatory_element" not in expected_response
        ):
            assert "warnings" in response
            assert set(response["warnings"]) == set(expected_response["warnings"])
            return
        response_re = response["regulatory_element"]
        expected_re = expected_response["regulatory_element"]
        assert response_re["type"] == expected_re["type"]
        assert response_re.get("regulatory_class") == expected_re.get(
            "regulatory_class"
        )
        assert response_re.get("feature_id") == expected_re.get("feature_id")
        assert response_re.get("associated_gene") == expected_re.get("associated_gene")
        assert response_re.get("location_descriptor") == expected_re.get(
            "location_descriptor"
        )

    return check_re_response


@pytest.mark.asyncio
async def test_build_tx_segment_ect(
    check_response, check_tx_element_response, ntrk1_tx_element_start
):
    """Test correct functioning of transcript segment element construction using exon
    coordinates and transcript.
    """
    await check_response(
        "/construct/structural_element/tx_segment_ect?transcript=NM_002529.3&exon_start=2&exon_start_offset=1",  # noqa: E501
        {"element": ntrk1_tx_element_start},
        check_tx_element_response,
    )

    # test require exon_start or exon_end
    await check_response(
        "/construct/structural_element/tx_segment_ect?transcript=NM_002529.3",
        {"warnings": ["Must provide either `exon_start` or `exon_end`"]},
        check_tx_element_response,
    )

    # test handle invalid transcript
    await check_response(
        "/construct/structural_element/tx_segment_ect?transcript=NM_0012529.3&exon_start=3",
        {"warnings": ["Unable to get exons for NM_0012529.3"]},
        check_tx_element_response,
    )


@pytest.mark.asyncio
async def test_build_segment_gct(
    check_response, check_tx_element_response, tpm3_tx_t_element
):
    """Test correct functioning of transcript segment element construction using
    genomic coordinates and transcript.
    """
    await check_response(
        "/construct/structural_element/tx_segment_gct?transcript=NM_152263.4&chromosome=NC_000001.11&start=154171416&end=154171417&strand=-",  # noqa: E501
        {"element": tpm3_tx_t_element},
        check_tx_element_response,
    )


@pytest.mark.asyncio
async def test_build_segment_gcg(
    check_response, check_tx_element_response, tpm3_tx_g_element
):
    """Test correct functioning of transcript segment element construction using
    genomic coordinates and gene name.
    """
    await check_response(
        "/construct/structural_element/tx_segment_gcg?gene=TPM3&chromosome=NC_000001.11&start=154171416&end=154171417&strand=-",  # noqa: E501
        {"element": tpm3_tx_g_element},
        check_tx_element_response,
    )


@pytest.mark.asyncio
async def test_build_reg_element(check_response, check_reg_element_response):
    """Test correctness of regulatory element constructor endpoint."""
    await check_response(
        "/construct/regulatory_element?element_class=promoter&gene_name=braf",
        {
            "regulatory_element": {
                "associated_gene": {
                    "gene_id": "hgnc:1097",
                    "id": "normalize.gene:braf",
                    "label": "BRAF",
                    "type": "GeneDescriptor",
                },
                "regulatory_class": "promoter",
                "type": "RegulatoryElement",
            }
        },
        check_reg_element_response,
    )
