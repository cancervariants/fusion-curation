"""Test computation services."""
from curation.gene_services import get_gene_id, get_possible_genes


def test_get_gene_id():
    """Test gene ID fetching service."""
    gene_id, warnings = get_gene_id('ABL1')
    assert gene_id == 'hgnc:76'
    assert warnings == []

    gene_id, warnings = get_gene_id('ABL33')
    assert gene_id is None
    assert warnings == ['Lookup of gene term ABL33 failed.']


def test_get_matching_genes():
    """Test gene term autocomplete service."""
    suggestions = get_possible_genes('braf')['matches']
    assert suggestions[0] == 'braf'  # check exact match is first
    assert set(suggestions) == {
        "braf", "brafps1", "brafps2", "braf", "braf1", "braf25", "braf2", "braf35", "brafp1"
    }

    suggestions = get_possible_genes('ntr')['matches']
    assert set(suggestions) == {
        "ntr", "ntrenv", "ntrkr2", "ntrk2", "ntri", "ntra", "ntr2", "ntr3", "ntrk3-as1", "ntrk4",
        "ntrk3", "ntrk1", "ntrkr1", "ntr1", "ntrkr3"
    }
