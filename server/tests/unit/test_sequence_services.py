"""Test sequence_id retrieval service"""
from curation.sequence_services import get_ga4gh_sequence_id
from typing import List


def check_get_sequence_id(sequence: str, expected_sequence_id: str, expected_warnings: List[str]):
    """Check correctness of get_sequence_id results
    :param str sequence: sequence term to test
    :param str expected_sequence_id: expected result of get_sequence_id
    :param List[str] warnings: expected warnings to result
    :raises AssertionError: if expected != actual
    """
    (sequence_id, warnings) = get_ga4gh_sequence_id(sequence)
    assert sequence_id == expected_sequence_id
    assert set(warnings) == set(expected_warnings)


def test_sequence_id():
    """Test that sequence inputs resolve to correct sequence IDs."""
    check_get_sequence_id('refseq:NC_000001.11', 'ga4gh:SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO', [])

    check_get_sequence_id('refseq:NM_152263.3', 'ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT', [])

    # namespace not always necessary
    check_get_sequence_id('NM_152263.3', 'ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT', [])

    check_get_sequence_id('refseq:NM_002529.3', 'ga4gh:SQ.RSkww1aYmsMiWbNdNnOTnVDAM3ZWp1uA', [])

    # require recognized namespace
    check_get_sequence_id(
        'refsq:NM_002529.3',
        '',
        ["Unable to retrieve GA4GH sequence ID for refsq:NM_002529.3: 'Alias NM_002529.3 (namespace: refsq)'"]  # noqa: E501
    )

    # require correct assembly
    check_get_sequence_id(
        'refseq:NC_000001.19',
        '',
        ["Unable to retrieve GA4GH sequence ID for refseq:NC_000001.19: 'Alias NC_000001.19 (namespace: refseq)'"]  # noqa: E501
    )
