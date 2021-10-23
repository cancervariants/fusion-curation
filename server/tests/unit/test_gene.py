"""Test computation services."""
import pytest

from curation import ServiceWarning
from curation.gene_services import get_gene_id, suggest_genes


def test_get_gene_id():
    """Test gene ID fetching service."""
    assert get_gene_id('ABL1') == 'hgnc:76'

    match = r"Lookup of gene term ABL33 failed."
    with pytest.raises(ServiceWarning, match=match):
        get_gene_id('ABL33')


def test_get_matching_genes():
    """Test gene term autocomplete service."""
    assert suggest_genes('brca') == [
        (
            "brca1",
            "hgnc:1100",
            "BRCA1",
            "term"
        ),
        (
            "brcat107",
            "hgnc:53093",
            "LINC02224",
            "term"
        ),
        (
            "brca3",
            "ncbigene:60500",
            "BRCA3",
            "term"
        ),
        (
            "brcacox",
            "hgnc:120",
            "ACOX2",
            "term"
        ),
        (
            "brcai",
            "hgnc:1100",
            "BRCA1",
            "term"
        ),
        (
            "brcata",
            "ncbigene:8068",
            "BRCATA",
            "term"
        ),
        (
            "brca2",
            "hgnc:1101",
            "BRCA2",
            "term"
        ),
        (
            "brca1p1",
            "hgnc:28470",
            "BRCA1P1",
            "term"
        ),
        (
            "brcaa1",
            "hgnc:15550",
            "ARID4B",
            "term"
        ),
        (
            "brcat8",
            "hgnc:51144",
            "LINC01488",
            "term"
        ),
        (
            "brcax",
            "ncbigene:60500",
            "BRCA3",
            "term"
        ),
        (
            "brcat54",
            "hgnc:53420",
            "MRPS30-DT",
            "term"
        )
    ]

    assert suggest_genes('ntr') == [
        (
            "ntr",
            "hgnc:8039",
            "NTSR1",
            "term"
        ),
        (
            "ntrkr2",
            "hgnc:10257",
            "ROR2",
            "term"
        ),
        (
            "ntra",
            "hgnc:17302",
            "NEGR1",
            "term"
        ),
        (
            "ntrk3-as1",
            "hgnc:27532",
            "NTRK3-AS1",
            "term"
        ),
        (
            "ntrkr3",
            "hgnc:2731",
            "DDR2",
            "term"
        ),
        (
            "ntrk1",
            "hgnc:8031",
            "NTRK1",
            "term"
        ),
        (
            "ntr2",
            "hgnc:8040",
            "NTSR2",
            "term"
        ),
        (
            "ntrenv",
            "hgnc:37653",
            "ERVW-2",
            "term"
        ),
        (
            "ntr3",
            "hgnc:11186",
            "SORT1",
            "term"
        ),
        (
            "ntrkr1",
            "hgnc:10256",
            "ROR1",
            "term"
        ),
        (
            "ntrk2",
            "hgnc:8032",
            "NTRK2",
            "term"
        ),
        (
            "ntrk3",
            "hgnc:8033",
            "NTRK3",
            "term"
        ),
        (
            "ntr1",
            "hgnc:17165",
            "TFIP11",
            "term"
        ),
        (
            "ntrk4",
            "hgnc:2730",
            "DDR1",
            "term"
        ),
        (
            "ntri",
            "hgnc:17941",
            "NTM",
            "term"
        )
    ]

    assert suggest_genes('sdflk') == []

    match = r"Got \d* possible matches for b \(exceeds 50\)"
    with pytest.raises(ServiceWarning, match=match):
        suggest_genes('b')
