import { v4 as uuid } from 'uuid';
import { useContext, useEffect } from 'react';
import { FusionContext } from '../../../../global/contexts/FusionContext';

import Builder from '../Builder/Builder';

import './Structure.scss';

interface Props {
  index: number
}


// const Text = React.memo(() => {
//   const {fusion} = useContext(FusionContext);
// });

export const Structure: React.FC<Props> = ( { index }) => {

  //TODO: remove this
//   useEffect(() => {
//     setFusion({
//     "r_frame_preserved": true,
//     "protein_domains": [
//         {
//             "status": "lost",
//             "name": "cystatin domain",
//             "id": "interpro:IPR000010",
//             "gene_descriptor": {
//                 "id": "gene:CST1",
//                 "gene_id": "hgnc:2743",
//                 "label": "CST1",
//                 "type": "GeneDescriptor"
//             }
//         }
//     ],
//     "transcript_components": [
//         {
//             "component_type": "transcript_segment",
//             "component_id": uuid(),
//             "component_name": "NM_152263.3",
//             "transcript": "refseq:NM_152263.3",
//             "exon_start": 1,
//             "exon_start_offset": 0,
//             "exon_end": 8,
//             "exon_end_offset": 0,
//             "gene_descriptor": {
//                 "id": "gene:TPM3",
//                 "gene_id": "hgnc:12012",
//                 "type": "GeneDescriptor",
//                 "label": "TPM3"
//             },
//             "component_genomic_region": {
//                 "id": "refseq:NM_152263.3_exon1-exon8",
//                 "component_name": "refseq:NM_152263.3_exon1-exon8",
//                 "type": "LocationDescriptor",
//                 "location": {
//                     "sequence_id": "ga4gh:SQ.ijXOSP3XSsuLWZhXQ7_TJ5JXu4RJO6VT",
//                     "type": "SequenceLocation",
//                     "interval": {
//                         "start": {
//                             "type": "Number",
//                             "value": 154192135
//                         },
//                         "end": {
//                             "type": "Number",
//                             "value": 154170399
//                         },
//                         "type": "SequenceInterval"
//                     }
//                 }
//             }
//         },
//         {
//             "component_type": "gene",
//             "component_name": "ALK",
//             "component_id": uuid(),
//             "gene_descriptor": {
//                 "id": "gene:ALK",
//                 "type": "GeneDescriptor",
//                 "gene_id": "hgnc:427",
//                 "label": "ALK"
//             }
//         },
//         {
//             "component_type": "linker_sequence",
//             "component_name": "ACGT",
//             "component_id": uuid(),
//             "linker_sequence": {
//                 "id": "sequence:ACGT",
//                 "type": "SequenceDescriptor",
//                 "sequence": "ACGT",
//                 "residue_type": "SO:0000348"
//             }
//         },
//         {
//             "component_type": "genomic_region",
//             "component_id": uuid(),
//             "component_name": "chr12:44908821-44908822(+)",
//             "region": {
//                 "id": "chr12:44908821-44908822(+)",
//                 "type": "LocationDescriptor",
//                 "location": {
//                     "type": "SequenceLocation",
//                     "sequence_id": "ga4gh:SQ.6wlJpONE3oNb4D69ULmEXhqyDZ4vwNfl",
//                     "interval": {
//                         "type": "SequenceInterval",
//                         "start": {
//                             "type": "Number",
//                             "value": 44908821
//                         },
//                         "end": {
//                             "type": "Number",
//                             "value": 44908822
//                         }
//                     }
//                 },
//                 "label": "chr12:44908821-44908822(+)"
//             },
//             "strand": "+"
//         },
//         {
//             "component_type": "unknown_gene"
//         }
//     ],
//     "causative_event": "rearrangement",
//     "regulatory_elements": [
//         {
//             "type": "promoter",
//             "element_name": "BRAF",
//             "element_id": uuid(),
//             "gene_descriptor": {
//                 "id": "gene:BRAF",
//                 "type": "GeneDescriptor",
//                 "gene_id": "hgnc:1097",
//                 "label": "BRAF"
//             }
//         }
//     ]
//     })
//   }, [])

  const {fusion, setFusion} = useContext(FusionContext);

  const structure = fusion.transcript_components || [];

  return (
    <div className="structure-tab-container">

      <div className="structure-summary">

        <h3>Structure Overview</h3>

        <h5>Drag and rearrange components to build the chimeric transcript.</h5>

        {/* <div className="summary-container">
          <div >
            {
              structure.map((comp, index) => (
                <span key={comp.component_id}>{`${index ? "::" : ""}${comp.hr_name}`}</span>
              ))
            }
          </div>
        </div> */}

        {/* <div className="summary-container">
          <div >
            {
              structure.map(comp => (
                <span key={comp.component_id} className={comp.component_type}>{`${comp.component_name}`} </span>
              ))
            }
          </div>
        </div> */}
      </div>

      <Builder/>

    </div>
  )

}