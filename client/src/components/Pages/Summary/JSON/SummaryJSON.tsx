import copy from 'clipboard-copy';
import { useEffect, useState } from 'react';
import { validateFusion } from '../../../../services/main';
import {
  AnyGeneComponent, ClientFusion, CriticalDomain, Fusion, GeneComponent, LinkerComponent,
  RegulatoryElement, TemplatedSequenceComponent, TranscriptSegmentComponent, UnknownGeneComponent
} from '../../../../services/ResponseModels';
import './SummaryJSON.scss';

interface Props {
  fusion: ClientFusion;
}

export const SummaryJSON: React.FC<Props> = ({ fusion }) => {

  const [isDown, setIsDown] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [printedFusion, setPrintedFusion] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    // drop client fields
    const formattedFusion: Fusion = {
      structural_components: fusion.structural_components?.map(comp => {
        switch (comp.component_type) {
          case 'transcript_segment':
            const txSegment: TranscriptSegmentComponent = {
              component_type: comp.component_type,
              transcript: comp.transcript,
              exon_start: comp.exon_start,
              exon_start_offset: comp.exon_start_offset,
              exon_end: comp.exon_end,
              exon_end_offset: comp.exon_end_offset,
              gene_descriptor: comp.gene_descriptor,
              component_genomic_start: comp.component_genomic_start,
              component_genomic_end: comp.component_genomic_end,
            };
            return txSegment;
          case 'templated_sequence':
            const templatedSequence: TemplatedSequenceComponent = {
              component_type: comp.component_type,
              strand: comp.strand,
              region: comp.region,
            };
            return templatedSequence;
          case 'linker_sequence':
            const linkerSequence: LinkerComponent = {
              component_type: comp.component_type,
              linker_sequence: comp.linker_sequence
            };
            return linkerSequence;
          case 'gene':
            const geneComponent: GeneComponent = {
              component_type: comp.component_type,
              gene_descriptor: comp.gene_descriptor,
            };
            return geneComponent;
          case 'any_gene':
            const anyGene: AnyGeneComponent = {
              component_type: comp.component_type
            };
            return anyGene;
          case 'unknown_gene':
            const unknownGene: UnknownGeneComponent = {
              component_type: comp.component_type
            };
            return unknownGene;
        }
      }),
      causative_event: fusion.causative_event,
      regulatory_elements: fusion.regulatory_elements?.map(e => {
        const element: RegulatoryElement = {
          type: e.type,
          gene_descriptor: e.gene_descriptor
        };
        return element;
      }),
      protein_domains: fusion.protein_domains?.map(domain => {
        const newDomain: CriticalDomain = {
          id: domain.id,
          name: domain.name,
          status: domain.status,
          gene_descriptor: domain.gene_descriptor
        };
        return newDomain;
      }),
    };
    validateFusion(formattedFusion)
      .then(response => {
        if (response.warnings?.length > 0) {
          // if (JSON.stringify(response.warnings.sort()) !==
          //   JSON.stringify(validationErrors.sort())) {
          setValidationErrors(response.warnings);
          // }
        } else {
          setPrintedFusion(JSON.stringify(response.fusion, null, 2));
        }
      });
  }, [fusion]);

  const handleCopy = () => {
    copy(printedFusion);
    setIsDown(false);
    setIsCopied(true);
  };

  const handleMouseDown = () => {
    setIsDown(true);
  };

  return (
    <>
      {
        validationErrors.length > 0 ?
          <div className="summary-json-container summary-json-container-error">
            {
              fusion.structural_components?.length > 2 ?
                <>{JSON.stringify(validationErrors)}</>
                : <>Must provide at least 2 structural components</>
            }
          </div>
          :
          <>
            <div className="headline">
              <span className="copy-message">
                {isCopied ? 'Copied to Clipboard!' : 'Click to Copy'}
              </span>
            </div>
            <pre
              className={`${isDown ? 'clicking' : ''} summary-json-container`}
              onClick={handleCopy}
              onMouseDown={handleMouseDown}
            >
              <div>
                {printedFusion}
              </div>
            </pre>
          </>
      }
    </>
  );
};
