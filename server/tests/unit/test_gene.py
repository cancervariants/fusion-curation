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
    assert suggest_genes('BRCA1') == [
        (
            "",
            "hgnc:1100",
            "BRCA1",
            "symbol"
        ),
        (
            "",
            "hgnc:28470",
            "BRCA1P1",
            "symbol"
        ),
        (
            "BRCA1 associated protein",
            "hgnc:1099",
            "BRAP",
            "label"
        ),
        (
            "BRCA1 associated RING domain 1",
            "hgnc:952",
            "BARD1",
            "label"
        ),
        (
            "BRCA1 associated ATM activator 1",
            "hgnc:21701",
            "BRAT1",
            "label"
        ),
        (
            "BRCA1 intronic recombination region",
            "ncbigene:110485084",
            "LOC110485084",
            "label"
        ),
        (
            "BRCA1/BRCA2-containing complex subunit 3",
            "hgnc:24185",
            "BRCC3",
            "label"
        ),
        (
            "BRCA1 intron 2 regulatory region",
            "ncbigene:111589216",
            "LOC111589216",
            "label"
        ),
        (
            "BRCA1/BRCA2-containing complex subunit 3 pseudogene 1",
            "hgnc:51444",
            "BRCC3P1",
            "label"
        ),
        (
            "BRCA1 DNA repair associated",
            "hgnc:1100",
            "BRCA1",
            "label"
        ),
        (
            "BRCA1 pseudogene 1",
            "hgnc:28470",
            "BRCA1P1",
            "label"
        ),
        (
            "BRCA1 interacting helicase 1",
            "hgnc:20473",
            "BRIP1",
            "label"
        ),
        (
            "BRCA1 associated protein 1",
            "hgnc:950",
            "BAP1",
            "label"
        ),
        (
            "BRCA1P1 intergenic recombination region",
            "ncbigene:110485085",
            "LOC110485085",
            "label"
        ),
        (
            "BRCA1 promoter region",
            "ncbigene:111589215",
            "LOC111589215",
            "label"
        )
    ]

    assert suggest_genes('ntr') == [
        (
            "",
            "hgnc:27532",
            "NTRK3-AS1",
            "symbol"
        ),
        (
            "",
            "hgnc:8033",
            "NTRK3",
            "symbol"
        ),
        (
            "",
            "hgnc:8032",
            "NTRK2",
            "symbol"
        ),
        (
            "",
            "hgnc:8031",
            "NTRK1",
            "symbol"
        ),
        (
            "NTRK3 antisense RNA 1",
            "hgnc:27532",
            "NTRK3-AS1",
            "label"
        ),
        (
            "NTR",
            "hgnc:8039",
            "NTSR1",
            "alias"
        ),
        (
            "NTrenv",
            "hgnc:37653",
            "ERVW-2",
            "alias"
        ),
        (
            "NTR3",
            "hgnc:11186",
            "SORT1",
            "alias"
        ),
        (
            "NTRI",
            "hgnc:17941",
            "NTM",
            "alias"
        ),
        (
            "NTRK4",
            "hgnc:2730",
            "DDR1",
            "alias"
        ),
        (
            "NTRKR1",
            "hgnc:10256",
            "ROR1",
            "alias"
        ),
        (
            "NTRKR3",
            "hgnc:2731",
            "DDR2",
            "alias"
        ),
        (
            "NTR2",
            "hgnc:8040",
            "NTSR2",
            "alias"
        ),
        (
            "NTR1",
            "hgnc:17165",
            "TFIP11",
            "alias"
        ),
        (
            "NTRKR2",
            "hgnc:10257",
            "ROR2",
            "alias"
        ),
        (
            "Ntra",
            "hgnc:17302",
            "NEGR1",
            "alias"
        ),
        (
            "NTRK4",
            "hgnc:2730",
            "DDR1",
            "prev_symbol"
        ),
        (
            "NTRKR1",
            "hgnc:10256",
            "ROR1",
            "prev_symbol"
        ),
        (
            "NTRKR3",
            "hgnc:2731",
            "DDR2",
            "prev_symbol"
        ),
        (
            "NTRKR2",
            "hgnc:10257",
            "ROR2",
            "prev_symbol"
        )
    ]

    assert suggest_genes('sdflk') == []

    match = r"Got \d* possible matches for b \(exceeds 50\)"
    with pytest.raises(ServiceWarning, match=match):
        suggest_genes('b')
