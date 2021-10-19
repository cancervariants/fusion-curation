"""Unit tests for functional domain lookup services."""
import pytest

from curation import ServiceWarning
from curation.domain_services import get_possible_domains


def test_get_possible_domains():
    """Test that associated domain retrieval returns correct values."""
    # test normal searches
    response = get_possible_domains("hgnc:8031")
    assert len(response) == 7
    assert set(response) == {
        ("interpro:IPR000483", "Cysteine-rich flanking region, C-terminal"),
        ("interpro:IPR000719", "Protein kinase domain"),
        ("interpro:IPR001245",
         "Serine-threonine/tyrosine-protein kinase, catalytic domain"),
        ("interpro:IPR007110", "Immunoglobulin-like domain"),
        ("interpro:IPR020635", "Tyrosine-protein kinase, catalytic domain"),
        ("interpro:IPR031635",
         "Tyrosine-protein kinase receptor NTRK, C2-Ig-like domain"),
        ("interpro:IPR040665", "Tyrosine kinase receptor A, transmembrane domain")
    }

    response = get_possible_domains("hgnc:1097")
    assert len(response) == 5
    assert set(response) == {
        ("interpro:IPR000719", "Protein kinase domain"),
        ("interpro:IPR001245",
         "Serine-threonine/tyrosine-protein kinase, catalytic domain"),
        ("interpro:IPR002219",
         "Protein kinase C-like, phorbol ester/diacylglycerol-binding domain"),
        ("interpro:IPR003116", "Raf-like Ras-binding"),
        ("interpro:IPR020454", "Diacylglycerol/phorbol-ester binding")
    }

    # test that only unique pairs are given
    response = get_possible_domains("hgnc:7897")
    assert len(response) == 2
    assert set(response) == {
        ("interpro:IPR000731", "Sterol-sensing domain"),
        ("interpro:IPR032190", "Niemann-Pick C1, N-terminal"),
    }

    # test raise warning on fail
    with pytest.raises(ServiceWarning):
        response = get_possible_domains("hgnc:28337")
