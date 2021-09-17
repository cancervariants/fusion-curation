import './Summary.scss'
import { ResponsesContext } from '../../../../global/contexts/ResponsesContext';
import React, { useContext, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Go from './Go';

interface Props {
  index: number
}

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export const Summary: React.FC<Props> = ( { index }) => {
  const classes = useStyles();

  const {responses, setResponses} = useContext(ResponsesContext);

  const [data, setData] = useState(json)

  useEffect(() => {

    setData(json);
  })

  return (
    <div className="summary">
      <div className="row-items">
      <div className="row">
        <div className="left-item">Gene </div>
        <div className="right-item">{`${data[0].genes[0]} :: ${data[0].genes[1]}`}</div>
      </div>
      <div className="row">
        <span className="left-item">Structure </span>
        <span className="right-item">{`${data[0].genes[0]} :: ${data[0].genes[1]}`} </span>
      </div>
      <div className="row">
        <span className="left-item">Regulatory Elements  </span>
        <span className="right-item">enhancer IGH, promoter MYC</span>
      </div>
      <div className="row">
        <span className="left-item">Protein Domains</span>
        <span className="right-item">preserved: MYC kinase domain </span>
      </div>
      </div>
      

      <div className="save-button">
      <Button style={{width: '300px', marginTop: "30px"}} variant="contained" color="primary">Save</Button>
      </div>
    
    </div>
  )
}

let json = [
  { genes: ['BCR', 'ABL1']},
  { structure: [
    {
        component_type: "transcript_segment",
        transcript: "refseq:NM_152263.3",
        exon_start: 1,
        exon_start_offset: 0,
        exon_end: 8,
        exon_end_offset: 0,
        gene_descriptor: {
            id: "gene:TPM3",
            gene_id: "hgnc:12012",
            type: "GeneDescriptor",
            label: "TPM3"
        },
        component_genomic_region: {
            id: "refseq:NM_152263.3_exon1-exon8",
            type: "LocationDescriptor",
            location: {
                "sequence_id": "ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT",  
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
  ]},
  { regulatory_elements: [
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
  },
  { protein_domains: [
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
  ]},
  { causativeEvent: 'unknown'},
  { readingFramePreserved: true}
]