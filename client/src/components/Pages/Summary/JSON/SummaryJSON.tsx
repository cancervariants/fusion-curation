import copy from "clipboard-copy";
import React, { useEffect, useState } from "react";
import {
  ClientElementUnion,
  ElementUnion,
  validateFusion,
} from "../../../../services/main";
import {
  AssayedFusion,
  CategoricalFusion,
  FunctionalDomain,
  GeneElement,
  LinkerElement,
  MultiplePossibleGenesElement,
  TemplatedSequenceElement,
  TranscriptSegmentElement,
  UnknownGeneElement,
} from "../../../../services/ResponseModels";
import { FusionType } from "Main/Summary";
import "./SummaryJSON.scss";

interface Props {
  fusion: FusionType;
}

export const SummaryJSON: React.FC<Props> = ({ fusion }) => {
  const [isDown, setIsDown] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [printedFusion, setPrintedFusion] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  /**
   * On component render, restructure fusion to drop properties used for client state purposes,
   * transmit to validation endpoint, and update local copy.
   */
  useEffect(() => {
    const structuralElements: ElementUnion[] = fusion.structural_elements?.map(
      (element: ClientElementUnion) => {
        switch (element.type) {
          case "GeneElement":
            const geneElement: GeneElement = {
              type: element.type,
              gene_descriptor: element.gene_descriptor,
            };
            return geneElement;
          case "LinkerSequenceElement":
            const linkerElement: LinkerElement = {
              type: element.type,
              linker_sequence: element.linker_sequence,
            };
            return linkerElement;
          case "TemplatedSequenceElement":
            const templatedSequenceElement: TemplatedSequenceElement = {
              type: element.type,
              region: element.region,
              strand: element.strand,
            };
            return templatedSequenceElement;
          case "TranscriptSegmentElement":
            const txSegmentElement: TranscriptSegmentElement = {
              type: element.type,
              transcript: element.transcript,
              exon_start: element.exon_start,
              exon_start_offset: element.exon_start_offset,
              exon_end: element.exon_end,
              exon_end_offset: element.exon_end_offset,
              gene_descriptor: element.gene_descriptor,
              element_genomic_start: element.element_genomic_start,
              element_genomic_end: element.element_genomic_end,
            };
            return txSegmentElement;
          case "MultiplePossibleGenesElement":
          case "UnknownGeneElement":
            const newElement:
              | MultiplePossibleGenesElement
              | UnknownGeneElement = {
              type: element.type,
            };
            return newElement;
          default:
            throw new Error("Unrecognized element type");
        }
      }
    );
    const regulatoryElements = fusion.regulatory_elements?.map((re) => ({
      type: re.type,
      associated_gene: re.associated_gene,
      regulatory_class: re.regulatory_class,
      feature_id: re.feature_id,
      genomic_location: re.genomic_location,
    }));
    let formattedFusion: AssayedFusion | CategoricalFusion;
    if (fusion.type === "AssayedFusion") {
      formattedFusion = {
        ...fusion,
        structural_elements: structuralElements,
        regulatory_elements: regulatoryElements,
      };
    } else {
      const criticalDomains: FunctionalDomain[] =
        fusion.critical_functional_domains?.map((domain) => ({
          _id: domain._id,
          label: domain.label,
          status: domain.status,
          associated_gene: domain.associated_gene,
          sequence_location: domain.sequence_location,
        }));
      formattedFusion = {
        ...fusion,
        structural_elements: structuralElements,
        regulatory_elements: regulatoryElements,
        critical_functional_domains: criticalDomains,
      };
    }

    // make request
    validateFusion(formattedFusion).then((response) => {
      if (response.warnings && response.warnings?.length > 0) {
        if (
          JSON.stringify(response.warnings.sort()) !==
          JSON.stringify(validationErrors.sort())
        ) {
          setValidationErrors(response.warnings);
        }
      } else {
        setPrintedFusion(JSON.stringify(response.fusion, null, 2));
      }
    });
  }, [fusion]); // should be blank?

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
      {validationErrors.length > 0 ? (
        <div className="summary-json-container summary-json-container-error">
          {JSON.stringify(validationErrors)}
        </div>
      ) : (
        <>
          <div className="headline">
            <span className="copy-message">
              {isCopied ? "Copied to Clipboard!" : "Click to Copy"}
            </span>
          </div>
          <pre
            className={`${isDown ? "clicking" : ""} summary-json-container`}
            onClick={handleCopy}
            onMouseDown={handleMouseDown}
          >
            <div>{printedFusion}</div>
          </pre>
        </>
      )}
    </>
  );
};
