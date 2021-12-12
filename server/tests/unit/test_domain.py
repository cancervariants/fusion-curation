"""Unit tests for functional domain lookup services."""
import pytest

from curation import ServiceWarning
from curation.domain_services import DomainService


@pytest.fixture(scope="module")
def domain_service():
    """Provide domain services class for tests."""
    ds = DomainService()
    ds.load_mapping()
    return ds


def test_get_possible_domains(domain_service):
    """Test that associated domain retrieval returns correct values."""
    # test normal searches
    query = "hgnc:8031"
    response = domain_service.get_possible_domains(query)
    assert response == [
        {
            "interpro_id": "interpro:IPR000483",
            "domain_name": "Cysteine-rich flanking region, C-terminal",
            "start": 148,
            "end": 192,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR000719",
            "domain_name": "Protein kinase domain",
            "start": 510,
            "end": 781,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR001245",
            "domain_name": "Serine-threonine/tyrosine-protein kinase, catalytic domain",
            "start": 512,
            "end": 781,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR001245",
            "domain_name": "Serine-threonine/tyrosine-protein kinase, catalytic domain",
            "start": 589,
            "end": 602,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR001245",
            "domain_name": "Serine-threonine/tyrosine-protein kinase, catalytic domain",
            "start": 640,
            "end": 658,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR001245",
            "domain_name": "Serine-threonine/tyrosine-protein kinase, catalytic domain",
            "start": 689,
            "end": 699,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR001245",
            "domain_name": "Serine-threonine/tyrosine-protein kinase, catalytic domain",
            "start": 708,
            "end": 730,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR001245",
            "domain_name": "Serine-threonine/tyrosine-protein kinase, catalytic domain",
            "start": 752,
            "end": 774,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR002011",
            "domain_name": "Tyrosine-protein kinase, receptor class II, conserved site",
            "start": 674,
            "end": 682,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR007110",
            "domain_name": "Immunoglobulin-like domain",
            "start": 194,
            "end": 283,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR008266",
            "domain_name": "Tyrosine-protein kinase, active site",
            "start": 646,
            "end": 658,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR017441",
            "domain_name": "Protein kinase, ATP binding site",
            "start": 516,
            "end": 544,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR020461",
            "domain_name": "Tyrosine-protein kinase, neurotrophic receptor, type 1",
            "start": 380,
            "end": 399,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR020461",
            "domain_name": "Tyrosine-protein kinase, neurotrophic receptor, type 1",
            "start": 439,
            "end": 454,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR020461",
            "domain_name": "Tyrosine-protein kinase, neurotrophic receptor, type 1",
            "start": 457,
            "end": 472,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR020635",
            "domain_name": "Tyrosine-protein kinase, catalytic domain",
            "start": 510,
            "end": 781,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR020777",
            "domain_name": "Tyrosine-protein kinase, neurotrophic receptor",
            "start": 86,
            "end": 111,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR020777",
            "domain_name": "Tyrosine-protein kinase, neurotrophic receptor",
            "start": 253,
            "end": 272,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR020777",
            "domain_name": "Tyrosine-protein kinase, neurotrophic receptor",
            "start": 344,
            "end": 361,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR031635",
            "domain_name": "Tyrosine-protein kinase receptor NTRK, C2-Ig-like domain",
            "start": 151,
            "end": 192,
            "refseq_ac": "NP_002520.2",
        },
        {
            "interpro_id": "interpro:IPR040665",
            "domain_name": "Tyrosine kinase receptor A, transmembrane domain",
            "start": 417,
            "end": 438,
            "refseq_ac": "NP_002520.2",
        },
    ]

    response = domain_service.get_possible_domains("hgnc:1097")
    assert response == [
        {
            "interpro_id": "interpro:IPR000719",
            "domain_name": "Protein kinase domain",
            "start": 457,
            "end": 717,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR000719",
            "domain_name": "Protein kinase domain",
            "start": 457,
            "end": 717,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR001245",
            "domain_name": "Serine-threonine/tyrosine-protein kinase, catalytic domain",
            "start": 458,
            "end": 712,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR002219",
            "domain_name": "Protein kinase C-like, phorbol ester/diacylglycerol-binding domain",  # noqa: E501
            "start": 235,
            "end": 280,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR002219",
            "domain_name": "Protein kinase C-like, phorbol ester/diacylglycerol-binding domain",  # noqa: E501
            "start": 235,
            "end": 280,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR002219",
            "domain_name": "Protein kinase C-like, phorbol ester/diacylglycerol-binding domain",  # noqa: E501
            "start": 234,
            "end": 280,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR002219",
            "domain_name": "Protein kinase C-like, phorbol ester/diacylglycerol-binding domain",  # noqa: E501
            "start": 235,
            "end": 280,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR002219",
            "domain_name": "Protein kinase C-like, phorbol ester/diacylglycerol-binding domain",  # noqa: E501
            "start": 235,
            "end": 280,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR003116",
            "domain_name": "Raf-like Ras-binding",
            "start": 157,
            "end": 225,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR003116",
            "domain_name": "Raf-like Ras-binding",
            "start": 155,
            "end": 227,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR003116",
            "domain_name": "Raf-like Ras-binding",
            "start": 155,
            "end": 227,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR008271",
            "domain_name": "Serine/threonine-protein kinase, active site",
            "start": 572,
            "end": 584,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR017441",
            "domain_name": "Protein kinase, ATP binding site",
            "start": 463,
            "end": 483,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR020454",
            "domain_name": "Diacylglycerol/phorbol-ester binding",
            "start": 232,
            "end": 246,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR020454",
            "domain_name": "Diacylglycerol/phorbol-ester binding",
            "start": 248,
            "end": 257,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR020454",
            "domain_name": "Diacylglycerol/phorbol-ester binding",
            "start": 257,
            "end": 268,
            "refseq_ac": "NP_004324.2",
        },
        {
            "interpro_id": "interpro:IPR020454",
            "domain_name": "Diacylglycerol/phorbol-ester binding",
            "start": 269,
            "end": 281,
            "refseq_ac": "NP_004324.2",
        },
    ]

    # test that only unique pairs are given
    response = domain_service.get_possible_domains("hgnc:7897")
    assert response == [
        {
            "interpro_id": "interpro:IPR000731",
            "domain_name": "Sterol-sensing domain",
            "start": 650,
            "end": 802,
            "refseq_ac": "NP_000262.2",
        },
        {
            "interpro_id": "interpro:IPR000731",
            "domain_name": "Sterol-sensing domain",
            "start": 620,
            "end": 785,
            "refseq_ac": "NP_000262.2",
        },
        {
            "interpro_id": "interpro:IPR003392",
            "domain_name": "Protein patched/dispatched",
            "start": 1039,
            "end": 1250,
            "refseq_ac": "NP_000262.2",
        },
        {
            "interpro_id": "interpro:IPR004765",
            "domain_name": "NPC1-like",
            "start": 25,
            "end": 1252,
            "refseq_ac": "NP_000262.2",
        },
        {
            "interpro_id": "interpro:IPR032190",
            "domain_name": "Niemann-Pick C1, N-terminal",
            "start": 23,
            "end": 266,
            "refseq_ac": "NP_000262.2",
        },
    ]

    # test raise warning on fail
    with pytest.raises(ServiceWarning):
        response = domain_service.get_possible_domains("hgnc:283373")
