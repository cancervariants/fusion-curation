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
    suggestions = get_possible_genes('braf')
    assert suggestions['matches'] == [
        ('brca1', 'hgnc:1100'),
        ('brca1', 'ncbigene:672'),
        ('brca1', 'ensembl:ensg00000012048'),
        ('brca1p1', 'hgnc:28470'),
        ('brca1p1', 'ncbigene:394269'),
        ('brca1p1', 'ensembl:ensg00000267595'),
        ('brca2', 'ncbigene:675'),
        ('brca2', 'hgnc:1101'),
        ('brca2', 'ensembl:ensg00000139618'),
        ('brca3', 'ncbigene:60500'),
        ('brcaa1', 'ncbigene:51742'),
        ('brcaa1', 'hgnc:15550'),
        ('brcacox', 'hgnc:120'),
        ('brcacox', 'ncbigene:8309'),
        ('brcai', 'ncbigene:672'),
        ('brcat107', 'hgnc:53093'),
        ('brcat107', 'ncbigene:102723839'),
        ('brcat54', 'hgnc:53420'),
        ('brcat54', 'ncbigene:100506674'),
        ('brcat8', 'ncbigene:101928292'),
        ('brcata', 'ncbigene:8068'),
        ('brcax', 'ncbigene:60500')
    ]
    assert suggestions['term'] == 'braf'
    assert suggestions.get('warnings') is None

    suggestions = get_possible_genes('ntr')
    assert suggestions['matches'] == [
        ('ntr', 'hgnc:8039'),
        ('ntr', 'ncbigene:4923'),
        ('ntr1', 'ncbigene:24144'),
        ('ntr2', 'ncbigene:23620'),
        ('ntr2', 'hgnc:8040'),
        ('ntr3', 'ncbigene:6272'),
        ('ntra', 'ncbigene:257194'),
        ('ntra', 'hgnc:17302'),
        ('ntrenv', 'hgnc:37653'),
        ('ntrenv', 'ncbigene:100379323'),
        ('ntri', 'hgnc:17941'),
        ('ntri', 'ncbigene:50863'),
        ('ntrk1', 'ncbigene:4914'),
        ('ntrk1', 'hgnc:8031'),
        ('ntrk1', 'ensembl:ensg00000198400'),
        ('ntrk2', 'hgnc:8032'),
        ('ntrk2', 'ncbigene:4915'),
        ('ntrk2', 'ensembl:ensg00000148053'),
        ('ntrk3', 'hgnc:8033'),
        ('ntrk3', 'ncbigene:4916'),
        ('ntrk3', 'ensembl:ensg00000140538'),
        ('ntrk3-as1', 'ensembl:ensg00000260305'),
        ('ntrk3-as1', 'hgnc:27532'),
        ('ntrk3-as1', 'ncbigene:283738'),
        ('ntrk4', 'hgnc:2730'),
        ('ntrk4', 'ncbigene:780'),
        ('ntrkr1', 'ncbigene:4919'),
        ('ntrkr1', 'hgnc:10256'),
        ('ntrkr2', 'hgnc:10257'),
        ('ntrkr2', 'ncbigene:4920'),
        ('ntrkr3', 'ncbigene:4921'),
        ('ntrkr3', 'hgnc:2731')
    ]
    assert suggestions['term'] == 'ntr'
    assert suggestions.get('warnings') is None

    suggestions = get_possible_genes('sdflk')
    assert suggestions.get('matches') is None
    assert suggestions['term'] == 'sdflk'
    assert suggestions['warnings'] == ['No matching terms found']

    suggestions = get_possible_genes('b')
    assert suggestions.get('matches') is None
    assert suggestions['term'] == 'b'
    assert suggestions['warnings'] == ['Max suggestions exceeded']
