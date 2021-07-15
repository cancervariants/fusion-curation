"""Test computation services."""
import pytest
from curation.gene_services import get_gene_id


def test_get_gene_id():
    """Test gene ID fetching service."""
    gene_id = get_gene_id('ABL1')
    assert gene_id == 'hgnc:76'

    with pytest.raises(LookupError):
        gene_id = get_gene_id('ABL33')
