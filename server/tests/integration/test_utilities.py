"""Test end-to-end correctness of utility routes."""

from collections.abc import Callable

import pytest

response_callback_type = Callable[[dict, dict], None]


@pytest.mark.asyncio()
async def test_get_mane_transcript(check_response):
    """Test MANE transcript retrieval endpoint."""

    def check_mane_response(response: dict, expected_response: dict):
        assert ("transcripts" in response) == ("transcripts" in expected_response)
        if not (response.get("transcripts")) and not (
            expected_response.get("transcripts")
        ):
            return
        for transcript in response["transcripts"]:
            assert len(response["transcripts"]) == len(expected_response["transcripts"])
            matched = False
            for expected_transcript in expected_response["transcripts"]:
                if transcript == expected_transcript:
                    assert not matched, "Multiple redundant results?"
                    matched = True
            assert matched, f"Could not find matching result: {transcript}"

    await check_response(
        "/api/utilities/get_transcripts?term=BRAF",
        {
            "transcripts": [
                {
                    "#NCBI_GeneID": "GeneID:673",
                    "Ensembl_Gene": "ENSG00000157764.14",
                    "HGNC_ID": "HGNC:1097",
                    "symbol": "BRAF",
                    "name": "B-Raf proto-oncogene, serine/threonine kinase",
                    "RefSeq_nuc": "NM_001374258.1",
                    "RefSeq_prot": "NP_001361187.1",
                    "Ensembl_nuc": "ENST00000644969.2",
                    "Ensembl_prot": "ENSP00000496776.1",
                    "MANE_status": "MANE Plus Clinical",
                    "GRCh38_chr": "NC_000007.14",
                    "chr_start": 140719337,
                    "chr_end": 140924929,
                    "chr_strand": "-",
                },
                {
                    "#NCBI_GeneID": "GeneID:673",
                    "Ensembl_Gene": "ENSG00000157764.14",
                    "HGNC_ID": "HGNC:1097",
                    "symbol": "BRAF",
                    "name": "B-Raf proto-oncogene, serine/threonine kinase",
                    "RefSeq_nuc": "NM_004333.6",
                    "RefSeq_prot": "NP_004324.2",
                    "Ensembl_nuc": "ENST00000646891.2",
                    "Ensembl_prot": "ENSP00000493543.1",
                    "MANE_status": "MANE Select",
                    "GRCh38_chr": "NC_000007.14",
                    "chr_start": 140730665,
                    "chr_end": 140924929,
                    "chr_strand": "-",
                },
            ]
        },
        check_mane_response,
    )

    await check_response(
        "/api/utilities/get_transcripts?term=FAKE_GENE999",
        {"warnings": ["Normalization error: FAKE_GENE999"]},
        check_mane_response,
    )


@pytest.mark.asyncio()
async def test_get_genomic_coords(check_response):
    """Test coordinates utility endpoint using genomic coords."""

    def check_genomic_coords_response(response: dict, expected_response: dict):
        assert ("coordinates_data" in response) == (
            "coordinates_data" in expected_response
        )
        if not (response.get("coordinates_data")) and not (
            expected_response.get("coordinates_data")
        ):
            assert "warnings" in response
            assert set(response["warnings"]) == set(expected_response["warnings"])
            return
        actual_coord_data = response["coordinates_data"]
        expected_coord_data = expected_response["coordinates_data"]

        assert actual_coord_data.get("gene") == expected_coord_data.get("gene")
        assert actual_coord_data["genomic_ac"] == expected_coord_data.get("genomic_ac")
        assert actual_coord_data.get("tx_ac") == expected_coord_data.get("tx_ac")
        assert actual_coord_data.get("seg_start") == expected_coord_data.get(
            "seg_start"
        )
        assert actual_coord_data.get("seg_end") == expected_coord_data.get("seg_end")

    await check_response(
        "/api/utilities/get_genomic?transcript=NM_002529.3&exon_start=1&exon_end=6",
        {
            "coordinates_data": {
                "gene": "NTRK1",
                "genomic_ac": "NC_000001.11",
                "tx_ac": "NM_002529.3",
                "seg_start": {
                    "exon_ord": 0,
                    "offset": 0,
                    "genomic_location": {
                        "type": "SequenceLocation",
                        "sequenceReference": {
                            "type": "SequenceReference",
                            "refgetAccession": "SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
                        },
                        "start": 156860878,
                    },
                },
                "seg_end": {
                    "exon_ord": 5,
                    "offset": 0,
                    "genomic_location": {
                        "type": "SequenceLocation",
                        "sequenceReference": {
                            "type": "SequenceReference",
                            "refgetAccession": "SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
                        },
                        "end": 156868647,
                    },
                },
                "errors": [],
                "service_meta": {
                    "name": "cool_seq_tool",
                    "version": "0.6.1.dev37+g1f798ae",
                    "response_datetime": "2024-08-22T17:42:06.009588Z",
                    "url": "https://github.com/GenomicMedLab/cool-seq-tool",
                },
            }
        },
        check_genomic_coords_response,
    )

    await check_response(
        "/api/utilities/get_genomic?transcript=NM_002529.3&exon_start=1&exon_end=6&gene=FAKE_GENE",
        {
            "warnings": [
                "Unable to find a result where NM_002529.3 has transcript coordinates 0 and 268 between an exon's start and end coordinates on gene FAKE_GENE"
            ]
        },
        check_genomic_coords_response,
    )


@pytest.mark.asyncio()
async def test_get_exon_coords(check_response):
    """Test /utilities/get_exon endpoint"""

    def check_coords_response(response: dict, expected_response: dict):
        """Provide to check_response to test specific response params"""
        assert ("coordinates_data" in response) == (
            "coordinates_data" in expected_response
        )
        if ("coordinates_data" not in response) and (
            "coordinates_data" not in expected_response
        ):
            return
        actual_coord_data = response["coordinates_data"]
        expected_coord_data = expected_response["coordinates_data"]

        assert actual_coord_data.get("gene") == expected_coord_data.get("gene")
        assert actual_coord_data["genomic_ac"] == expected_coord_data.get("genomic_ac")
        assert actual_coord_data.get("tx_ac") == expected_coord_data.get("tx_ac")
        assert actual_coord_data.get("seg_start") == expected_coord_data.get(
            "seg_start"
        )
        assert actual_coord_data.get("seg_end") == expected_coord_data.get("seg_end")

    await check_response(
        "/api/utilities/get_exon?chromosome=NC_000001.11&transcript=NM_152263.3&start=154192135",
        {
            "coordinates_data": {
                "gene": "TPM3",
                "genomic_ac": "NC_000001.11",
                "tx_ac": "NM_152263.3",
                "seg_start": {
                    "exon_ord": 0,
                    "offset": 0,
                    "genomic_location": {
                        "type": "SequenceLocation",
                        "sequenceReference": {
                            "type": "SequenceReference",
                            "refgetAccession": "SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
                        },
                        "end": 154192135,
                    },
                },
                "errors": [],
            }
        },
        check_coords_response,
    )

    await check_response(
        "/api/utilities/get_exon?chromosome=NC_000001.11",
        {
            "warnings": [
                "Must provide start and/or end coordinates",
                "Must provide gene and/or transcript",
            ]
        },
        check_coords_response,
    )


    # check correct response for genomic coordinate that occurs between exons (should get nearest junction)
    await check_response(
        "/api/utilities/get_exon?chromosome=NC_000001.11&end=154191900&transcript=NM_152263.3",
        {
            "coordinates_data": {
                "gene": "TPM3",
                "genomic_ac": "NC_000001.11",
                "tx_ac": "NM_152263.3",
                "seg_end": {
                    "exon_ord": 0,
                    "offset": 1,
                    "genomic_location": {
                        "type": "SequenceLocation",
                        "sequenceReference": {
                            "type": "SequenceReference",
                            "refgetAccession": "SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
                        },
                        "start": 154191900,
                    },
                },
                "errors": [],
            }
        },
        check_coords_response,
    )


@pytest.mark.asyncio()
async def test_get_sequence_id(check_response):
    """Test sequence ID lookup utility endpoint"""

    def check_sequence_id_response(response: dict, expected_response: dict):
        """Provide to check_response to test specific response params"""
        assert response["sequence"] == expected_response["sequence"]
        if response.get("ga4gh_id") or expected_response.get("ga4gh_id"):
            assert response["ga4gh_id"] == expected_response["ga4gh_id"]
        if response.get("aliases") or expected_response.get("aliases"):
            assert set(response["aliases"]) == set(expected_response["aliases"])

    await check_response(
        "/api/utilities/get_sequence_id?sequence=NC_000001.11",
        {
            "sequence": "NC_000001.11",
            "ga4gh_id": "ga4gh:SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
            "aliases": [
                "GRCh38:chr1",
                "GRCh38.p1:chr1",
                "GRCh38.p10:chr1",
                "GRCh38.p11:chr1",
                "GRCh38.p12:chr1",
                "GRCh38.p2:chr1",
                "GRCh38.p3:chr1",
                "GRCh38.p4:chr1",
                "GRCh38.p5:chr1",
                "GRCh38.p6:chr1",
                "GRCh38.p7:chr1",
                "GRCh38.p8:chr1",
                "GRCh38.p9:chr1",
                "MD5:6aef897c3d6ff0c78aff06ac189178dd",
                "SEGUID:FCUd6VJ6uikS/VWLbhGdVmj2rOA",
                "SHA1:14251de9527aba2912fd558b6e119d5668f6ace0",
                "VMC:GS_Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
                "sha512t24u:Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO",
            ],
        },
        check_sequence_id_response,
    )

    await check_response(
        "/api/utilities/get_sequence_id?sequence=NP_001278445.11",
        {
            "sequence": "NP_001278445.11",
            "warnings": ["Identifier NP_001278445.11 could not be retrieved"],
        },
        check_sequence_id_response,
    )
