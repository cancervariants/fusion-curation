"""Test sequence_id retrieval service"""
from curation.sequence_services import get_ga4gh_sequence_id
import pytest


def test_sequence_id():
    """Test that sequence inputs resolve to correct sequence IDs."""
    sequence = 'refseq:NC_000001.11'
    actual = get_ga4gh_sequence_id(sequence)
    assert actual == 'ga4gh:SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO'

    sequence = 'refseq:NM_152263.3'
    actual = get_ga4gh_sequence_id(sequence)
    assert actual == 'ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT'

    # namespace not always necessary
    sequence = 'NM_152263.3'
    actual = get_ga4gh_sequence_id(sequence)
    assert actual == 'ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT'

    sequence = 'refseq:NM_002529.3'
    actual = get_ga4gh_sequence_id(sequence)
    assert actual == 'ga4gh:SQ.RSkww1aYmsMiWbNdNnOTnVDAM3ZWp1uA'

    bad_sequences = [
        'refsq:NM_002529.3',  # require recognized namespace
        'refseq:NC_000001.19',  # require correct assembly
    ]

    for sequence in bad_sequences:
        with pytest.raises(KeyError):
            actual = get_ga4gh_sequence_id(sequence)
