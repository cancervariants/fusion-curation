"""Unit tests for functional domain lookup services."""
from curation.domain_services import domain_service
import pytest
from typing import Set


def test_get_domain_id():
    """Test that domain name searches resolve to correct Interpro ID."""
    query = 'Tyrosine-protein kinase, catalytic domain'
    assert domain_service.get_domain_id(query) == 'interpro:IPR020635'
    assert domain_service.get_domain_id(query.lower()) == 'interpro:IPR020635'

    query = 'Tyrosine protein kinase, catalytic domain'
    with pytest.raises(LookupError):
        domain_service.get_domain_id(query)


def test_get_possible_matches():
    """Test autocomplete services for domain name lookup."""
    def check_matches_correct(query: str, expected: Set[str]):
        matches = set(domain_service.get_possible_matches(query))
        assert matches == expected

    check_matches_correct('Tyrosine-protein kinase, re', {
        'Tyrosine-protein kinase, receptor class V, conserved site',
        'Tyrosine-protein kinase, receptor class III, conserved site',
        'Tyrosine-protein kinase, receptor class II, conserved site',
        'Tyrosine-protein kinase, receptor Tie-2, Ig-like domain 1, N-terminal',
        'Tyrosine-protein kinase, receptor ROR',
        'Tyrosine-protein kinase, Ret receptor'
    })

    check_matches_correct('antenna complex, alpha subunit', {
        'Antenna complex, alpha subunit conserved site',
        'Antenna complex, alpha subunit'
    })

    check_matches_correct('antenna complex, alpha subunit c', {
        'Antenna complex, alpha subunit conserved site'
    })

    # check that >10 matches truncates to 10
    check_matches_correct('ant', {
        "Antenna complex, alpha subunit conserved site",
        "Antimicrobial peptide, C6 type, conserved site",
        "Antenna complex, beta subunit, conserved site",
        "Antenna complex, alpha/beta subunit",
        "Anti-proliferative protein",
        "Antistasin-like domain",
        "Anticodon-binding",
        "Antirepressor protein, C-terminal",
        "Anthrax toxin, edema factor, central",
        "ANTAR domain"
    })

    check_matches_correct('nonsense_query', set())
