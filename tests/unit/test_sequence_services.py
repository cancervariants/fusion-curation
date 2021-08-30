"""Test sequence_id retrieval service"""
from curation.sequence_services import get_sequence_id


def test_sequence_id():
    """Test that sequence inputs resolve to correct sequence IDs."""
    sequence = 'refseq:NC_000001.11'
    actual = get_sequence_id(sequence)
    assert actual['sequence_id'] == 'ga4gh:SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO'
    assert actual['warnings'] == []

    sequence = 'refseq:NM_152263.3'
    actual = get_sequence_id(sequence)
    assert actual['sequence_id'] == 'ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT'
    assert actual['warnings'] == []

    # namespace not always necessary
    sequence = 'NM_152263.3'
    actual = get_sequence_id(sequence)
    assert actual['sequence_id'] == 'ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT'
    assert actual['warnings'] == []

    sequence = 'refseq:NM_002529.3'
    actual = get_sequence_id(sequence)
    assert actual['sequence_id'] == 'ga4gh:SQ.RSkww1aYmsMiWbNdNnOTnVDAM3ZWp1uA'
    assert actual['warnings'] == []

    bad_sequences = [
        'refsq:NM_002529.3',  # require recognized namespace
        'refseq:NC_000001.19',  # require correct assembly
    ]

    for sequence in bad_sequences:
        actual = get_sequence_id(sequence)
        assert actual['sequence_id'] == ''
        assert actual['warnings'] == [f'Lookup of sequence {sequence} failed.']
