"""Test computation services."""
from curation.gene_services import get_gene_id


def test_get_gene_id():
    """Test gene ID fetching service."""
    gene_id, warnings = get_gene_id('ABL1')
    assert gene_id == 'hgnc:76'
    assert warnings == []

    gene_id, warnings = get_gene_id('ABL33')
    assert gene_id is None
    assert warnings == ['Lookup of gene term ABL33 failed.']
