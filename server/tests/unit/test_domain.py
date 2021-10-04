"""Unit tests for functional domain lookup services."""
from typing import List, Set, Tuple, Optional

from curation.domain_services import domain_service


def check_domain_id_response(query: str, domain_id: Optional[str], warnings: List[str]):
    """Perform correctness checks for get_domain_id
    :param str query: query to test
    :param str domain_id: expected domain ID
    :param List[str] warnings: expected List of warnings
    :raises AssertionError: if actual != expected
    """
    (actual_id, actual_warnings) = domain_service.get_domain_id(query)
    assert actual_id == domain_id
    assert set(actual_warnings) == set(warnings)


def check_matches_correct(query: str, expected: Set[Tuple[str, str]], max_matches: int = 50):
    """Perform correctness checks for get_possible_matches
    :param str query: query term to test
    :param Set[str] expected: expected terms to retrieve
    :raises AssertionError: if actual != expected
    """
    matches = set(domain_service.get_possible_matches(query, n=max_matches))
    assert matches == expected


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
        None,
        ['Could not retrieve ID for domain Tyrosine protein kinase, catalytic domain']
    )
    query = 'Cytokine IL-3/IL-5/GM-CSF receptor common beta chain'
    check_domain_id_response(
        query,
        None,
        ['Could not retrieve ID for domain Cytokine IL-3/IL-5/GM-CSF receptor common beta chain']
    )


def test_get_possible_domains():
    """Test autocomplete services for domain name lookup."""
    check_matches_correct('Tyrosine-protein kinase, re', {
        ('Tyrosine-protein kinase, receptor class V, conserved site', 'interpro:IPR001426'),
        ('Tyrosine-protein kinase, receptor class III, conserved site', 'interpro:IPR001824'),
        ('Tyrosine-protein kinase, receptor class II, conserved site', 'interpro:IPR002011'),
        ('Tyrosine-protein kinase, receptor Tie-2, Ig-like domain 1, N-terminal',
         'interpro:IPR018941'),
    })

    check_matches_correct('antenna complex, alpha subunit', {
        ('Antenna complex, alpha subunit conserved site', 'interpro:IPR002361'),
    })

    check_matches_correct('antenna complex, alpha subunit c', {
        ('Antenna complex, alpha subunit conserved site', 'interpro:IPR002361')
    })

    # check that >10 matches truncates to 10
    check_matches_correct('ant', {
        ("Antenna complex, alpha subunit conserved site", 'interpro:IPR002361'),
        ("Antimicrobial peptide, C6 type, conserved site", 'interpro:IPR013006'),
        ("Antenna complex, beta subunit, conserved site", 'interpro:IPR023623'),
        ("Antenna complex, alpha/beta subunit", "interpro:IPR000066"),
        ("Anti-proliferative protein", "interpro:IPR002087"),
        ("Antistasin-like domain", "interpro:IPR004094"),
        ("Anticodon-binding", "interpro:IPR004154"),
        ("Antirepressor protein, C-terminal", "interpro:IPR005039"),
        ("Anthrax toxin, edema factor, central", "interpro:IPR005165"),
        ("ANTAR domain", "interpro:IPR005561"),
    }, 10)

    check_matches_correct('nonsense_query', set())
