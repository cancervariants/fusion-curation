"""Test validation services."""
from curation.validation_services import validate_fusion


def test_validate():
    """Test validation endpoint."""
    fusion = {
        "r_frame_preserved": True,
        "protein_domains": [
            {
                "status": "lost",
                "name": "Tyrosine-protein kinase, catalytic domain",
                "id": "interpro:IPR020635",
                "gene": {
                    "id": "curation:NTRK1",
                    "label": "NTRK1",
                    "value_id": "hgnc:8031"
                }
            }
        ],
        "transcript_components": [
            {
                "component_type": "transcript_segment",
                "transcript": "NM_152263.3",
                "gene": {
                    "label": "TPM3",
                    "id": "hgnc:12012"
                },
                "exon_start": 1,
                "exon_start_genomic": {
                    "chr": "NC_000001.11",
                    "pos": 154192135
                },
                "exon_end": 8,
                "exon_end_genomic": {
                    "chr": "NC_000001.11",
                    "pos": 154170399
                }
            },
            {
                "chr": "12",
                "strand": "8",
                "start_pos": "2348908",
                "end_pos": "34098234"
            }
        ],
        "regulatory_elements": [],
        "causative_event": {
            'event_type': 'rearrangement'
        }
    }
    expected = {
        'fusion': fusion,
        'warnings': []
    }
    response = validate_fusion(fusion)

    assert response == expected
