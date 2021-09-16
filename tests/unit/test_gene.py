"""Test computation services."""
import pytest
from curation.gene_services import gene_service


def test_get_gene_id():
    """Test gene ID fetching service."""
    gene_id = gene_service.get_gene_id('ABL1')
    assert gene_id == 'hgnc:76'

    with pytest.raises(LookupError):
        gene_id = gene_service.get_gene_id('ABL33')
