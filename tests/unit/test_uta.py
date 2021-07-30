"""Test UTA data source."""
import pytest
from curation.data_sources.uta import UTA
import copy


@pytest.fixture(scope='module')
def test_uta():
    """Create uta test fixture."""
    class TestUTA:

        def __init__(self):
            self.test_uta = UTA()

        def get_genomic_coords(self, tx_ac, start_exon, end_exon, start_exon_offset=0,
                               end_exon_offset=0, gene=None):
            return self.test_uta.get_genomic_coords(tx_ac, start_exon, end_exon, start_exon_offset,
                                                    end_exon_offset, gene)
    return TestUTA()


@pytest.fixture(scope='module')
def tpm3_exon1_exon8():
    """Create test fixture for TPM3."""
    return {
        "gene": "TPM3",
        "chr": "NC_000001.11",
        "start": 154192135,
        "end": 154170399,
        "start_exon": 1,
        "end_exon": 8,
        "exon_end_offset": 0,
        "exon_start_offset": 0
    }


@pytest.fixture(scope='module')
def ntrk1_exon10_exon17():
    """Create test fixture for NTRK1."""
    return {
        "gene": "NTRK1",
        "chr": "NC_000001.11",
        "start": 156874626,
        "end": 156881456,
        "start_exon": 10,
        "end_exon": 17,
        "exon_end_offset": 0,
        "exon_start_offset": 0
    }


def test_uta_source(test_uta, tpm3_exon1_exon8, ntrk1_exon10_exon17):
    """Test that uta data source works correctly."""
    # TPM3
    resp = test_uta.get_genomic_coords('NM_152263.3', 0, 8)
    assert resp == tpm3_exon1_exon8

    resp = test_uta.get_genomic_coords('NM_152263.3', 0, 8, gene="TPM3")
    assert resp == tpm3_exon1_exon8

    resp = test_uta.get_genomic_coords('NM_152263.3', 0, 8, gene="tpm3")
    assert resp == tpm3_exon1_exon8

    resp = test_uta.get_genomic_coords('NM_152263.3', 0, 0, gene="tpm3")
    expected = copy.deepcopy(tpm3_exon1_exon8)
    expected["end_exon"] = 10
    expected["end"] = 154161812
    assert resp == expected

    resp = test_uta.get_genomic_coords('NM_152263.3', 0, 8, end_exon_offset=-5)
    expected["end_exon"] = 8
    expected["exon_end_offset"] = -5
    expected["end"] = 154170404
    assert resp == expected

    resp = test_uta.get_genomic_coords('NM_152263.3', 0, 8, end_exon_offset=5)
    expected["exon_end_offset"] = 5
    expected["end"] = 154170394
    assert resp == expected

    resp = test_uta.get_genomic_coords('NM_152263.3', 3, 8, start_exon_offset=3, end_exon_offset=5)
    expected["start_exon"] = 3
    expected["exon_start_offset"] = 3
    expected["start"] = 154176245
    assert resp == expected

    resp = test_uta.get_genomic_coords('NM_152263.3', 3, 8, start_exon_offset=-3, end_exon_offset=5)
    expected["exon_start_offset"] = -3
    expected["start"] = 154176251
    assert resp == expected

    # NTRK1
    resp = test_uta.get_genomic_coords('NM_002529.3', 10, 0)
    assert resp == ntrk1_exon10_exon17

    resp = test_uta.get_genomic_coords('NM_002529.3', 10, 0, gene="NTRK1")
    assert resp == ntrk1_exon10_exon17

    resp = test_uta.get_genomic_coords('NM_002529.3', 10, 0, gene="NTRK1")
    assert resp == ntrk1_exon10_exon17

    resp = test_uta.get_genomic_coords('NM_002529.3', 10, 0, start_exon_offset=3)
    expected = copy.deepcopy(ntrk1_exon10_exon17)
    expected["exon_start_offset"] = 3
    expected["start"] = 156874629
    assert resp == expected

    resp = test_uta.get_genomic_coords('NM_002529.3', 10, 0, start_exon_offset=-3)
    expected["exon_start_offset"] = -3
    expected["start"] = 156874623


def test_no_matches(test_uta):
    """Test that invalid queries return None."""
    # Exon 22 does not exist
    resp = test_uta.get_genomic_coords('NM_152263.3', 0, 22)
    assert resp is None

    # Start > End
    resp = test_uta.get_genomic_coords('NM_152263.3', 8, 1)
    assert resp is None

    # End < Start
    resp = test_uta.get_genomic_coords('NM_152263.3', 7, 6)
    assert resp is None

    # Transcript DNE
    resp = test_uta.get_genomic_coords('NM_12345.6', 7, 0)
    assert resp is None

    # Index error for invalid exon
    resp = test_uta.get_genomic_coords('NM_12345.6', -1, 0)
    assert resp is None

    # Gene that does not match transcript
    resp = test_uta.get_genomic_coords('NM_152263.3', 8, 1, gene='NTKR1')
    assert resp is None
