"""Test sequence_id retrieval service"""
import re

import pytest

from curation import ServiceWarning
from curation.sequence_services import get_ga4gh_sequence_id


def test_sequence_id():
    """Test that sequence inputs resolve to correct sequence IDs."""
    assert get_ga4gh_sequence_id('refseq:NC_000001.11') == \
        'ga4gh:SQ.Ya6Rs7DHhDeg7YaOSg1EoNi3U_nQ9SvO'
    assert get_ga4gh_sequence_id('refseq:NM_152263.3') == \
        'ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT'

    # namespace not always necessary
    assert get_ga4gh_sequence_id('NM_152263.3') == \
        'ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT'

    assert get_ga4gh_sequence_id('refseq:NM_002529.3') == \
        'ga4gh:SQ.RSkww1aYmsMiWbNdNnOTnVDAM3ZWp1uA'

    # require recognized namespace
    match = re.escape("Unable to retrieve GA4GH sequence ID for refsq:NM_002529.3: "
                      "'Alias NM_002529.3 (namespace: refsq)'")
    with pytest.raises(ServiceWarning, match=match):
        get_ga4gh_sequence_id('refsq:NM_002529.3')

    # require correct assembly
    match = re.escape("Unable to retrieve GA4GH sequence ID for refseq:NC_000001.19: "
                      "'Alias NC_000001.19 (namespace: refseq)'")
    with pytest.raises(ServiceWarning, match=match):
        get_ga4gh_sequence_id('refseq:NC_000001.19')
