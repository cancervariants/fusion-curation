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
                "gene_descriptor": {
                    "id": "curation:NTRK1",
                    "label": "NTRK1",
                    "gene_id": "hgnc:8031"
                }
            }
        ],
        "transcript_components": [
            {
                "component_type": "transcript_segment",
                "transcript": "refseq:NM_152263.3",
                "exon_start": 1,
                "exon_start_offset": 0,
                "exon_end": 8,
                "exon_end_offset": 0,
                "gene_descriptor": {
                    "id": "gene:TPM3",
                    "gene_id": "hgnc:12012",
                    "type": "GeneDescriptor",
                    "label": "TPM3"
                },
                "component_genomic_region": {
                    "id": "refseq:NM_152263.3_exon1-exon8",
                    "type": "LocationDescriptor",
                    "location": {
                        "sequence_id": "ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT",  # noqa: E501
                        "type": "SequenceLocation",
                        "interval": {
                            "start": {
                                "type": "Number",
                                "value": 154192135
                            },
                            "end": {
                                "type": "Number",
                                "value": 154170399
                            },
                            "type": "SequenceInterval"
                        }
                    }
                }
            },
            {
                "component_type": "gene",
                "gene_descriptor": {
                    "id": "gene:ALK",
                    "type": "GeneDescriptor",
                    "gene_id": "hgnc:427",
                    "label": "ALK"
                }
            }
        ],
        "regulatory_elements": [
            {
                "type": "promoter",
                "gene_descriptor": {
                    "id": "gene:BRAF",
                    "type": "GeneDescriptor",
                    "gene_id": "hgnc:1097",
                    "label": "BRAF"
                }
            }
        ],
        "causative_event": 'rearrangement'
    }
    response = validate_fusion(fusion)

    # check no warnings
    assert response['warnings'] == []

    fusion = response['fusion']

    # spot check some values
    assert fusion['protein_domains'][0]['gene_descriptor']['gene_id'] == 'hgnc:8031'  # noqa: E501
    assert fusion['r_frame_preserved']
    assert fusion['transcript_components'][0]['exon_end'] == 8
    assert fusion['transcript_components'][0]['gene_descriptor']['label'] == 'TPM3'  # noqa: E501
    assert fusion['transcript_components'][0]['component_genomic_region']['location']['type'] == 'SequenceLocation'  # noqa: E501
    assert fusion['transcript_components'][1]['component_type'] == 'gene'
    assert fusion['regulatory_elements'][0]['type'] == 'promoter'
    assert fusion['regulatory_elements'][0]['gene_descriptor']['gene_id'] == 'hgnc:1097'  # noqa: E501
    assert fusion['causative_event'] == 'rearrangement'

    # empty fusion should fail
    response = validate_fusion({})
    assert response['warnings'] == [[{
        'loc': ('transcript_components',),
        'msg': 'field required',
        'type': 'value_error.missing'
    }]]
    assert response['fusion'] == {}

    # should get specific warnings for various fields
    fusion = {
        'r_frame_preserved': 98,
        'transcript_components': [
            {
                'component_type': 'gene',
                'gene_descriptor': {
                    'id': 'gene:BRAF',
                    'gene_id': 'hgnc:1097'
                }
            }
        ]
    }
    response = validate_fusion(fusion)
    assert response['warnings'] == [
        [
            {
                'loc': ('r_frame_preserved',),
                'msg': 'value is not a valid boolean',
                'type': 'value_error.strictbool'
            },
            {
                'loc': ('transcript_components',),
                'msg': 'Fusion must contain at least 2 transcript components.',
                'type': 'value_error'
            }
        ]
    ]
    assert response['fusion'] == {}
