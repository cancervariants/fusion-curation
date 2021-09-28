"""Unit tests for functional domain lookup services."""
from curation.domain_services import domain_service
from typing import List


def check_domain_id_response(query: str, domain_id: str, warnings: List[str]):
    """Perform correctness checks for get_domain_id
    :param str query: query to test
    :param str domain_id: expected domain ID
    :param List[str] warnings: expected List of warnings
    :raises AssertionError: if actual != expected
    """
    (actual_id, actual_warnings) = domain_service.get_domain_id(query)
    assert actual_id == domain_id
    assert set(actual_warnings) == set(warnings)


def test_get_domain_id():
    """Test that domain name searches resolve to correct Interpro ID."""
    # check domain term
    query = 'Tyrosine-protein kinase, catalytic domain'
    check_domain_id_response(query, 'interpro:IPR020635', [])

    # check case insensitive
    check_domain_id_response(query.lower(), 'interpro:IPR020635', [])

    # check active site term
    query = 'Phosphoglycerate/bisphosphoglycerate mutase, active site'
    check_domain_id_response(query, 'interpro:IPR001345', [])

    # check binding site term
    query = 'Aromatic-ring-hydroxylating dioxygenase, 2Fe-2S-binding site'
    check_domain_id_response(query, 'interpro:IPR015881', [])

    # check conserved site term
    query = 'NADH:ubiquinone oxidoreductase, 49kDa subunit, conserved site'
    check_domain_id_response(query, 'interpro:IPR014029', [])

    # bad queries
    query = 'Tyrosine protein kinase, catalytic domain'
    check_domain_id_response(
        query,
        '',
        ['Could not retrieve ID for domain Tyrosine protein kinase, catalytic domain']
    )
    query = 'Cytokine IL-3/IL-5/GM-CSF receptor common beta chain'
    check_domain_id_response(
        query,
        '',
        ['Could not retrieve ID for domain Cytokine IL-3/IL-5/GM-CSF receptor common beta chain']
    )
