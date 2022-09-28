import "./Summary.scss";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import React, { useContext, useEffect, useState } from "react";

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
  RegulatoryElement,
  TemplatedSequenceElement,
  TranscriptSegmentElement,
  UnknownGeneElement,
} from "../../../../services/ResponseModels";
import { Success } from "../Success/Success";
import { Invalid } from "../Invalid/Invalid";

export type FusionType = AssayedFusion | CategoricalFusion;

interface Props {
  index: number;
}

export const Summary: React.FC<Props> = ({ index }) => {
  const [validatedFusion, setValidatedFusion] = useState<
    AssayedFusion | CategoricalFusion | null
  >(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { fusion } = useContext(FusionContext);

  /**
   * Drop structural element metadata fields used by client
   * @param element clientside element to prune
   * @returns FUSOR-compliant element object
   */
  const fusorifyStructuralElement = (
    element: ClientElementUnion
  ): ElementUnion => {
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
        const newElement: MultiplePossibleGenesElement | UnknownGeneElement = {
          type: element.type,
        };
        return newElement;
      default:
        throw new Error("Unrecognized element type");
    }
  };

  /**
   * Send fusion validation request and update local state if successful
   * @param formattedFusion fusion with client-oriented properties dropped
   */
  const requestValidatedFusion = (
    formattedFusion: AssayedFusion | CategoricalFusion
  ) => {
    // make request
    validateFusion(formattedFusion).then((response) => {
      if (response.warnings && response.warnings?.length > 0) {
        if (
          validationErrors !== null &&
          JSON.stringify(response.warnings.sort()) !==
            JSON.stringify(validationErrors.sort())
        ) {
          setValidationErrors(response.warnings);
        }
      } else {
        setValidationErrors([]);
        setValidatedFusion(
          response.fusion as CategoricalFusion | AssayedFusion
        );
      }
    });
  };

  /**
   * On component render, restructure fusion to drop properties used for client state purposes,
   * transmit to validation endpoint, and update local copy.
   */
  useEffect(() => {
    const structuralElements: ElementUnion[] = fusion.structural_elements?.map(
      (element: ClientElementUnion) => fusorifyStructuralElement(element)
    );
    let regulatoryElement: RegulatoryElement | null = null;
    if (fusion.regulatory_element) {
      regulatoryElement = {
        type: fusion.regulatory_element.type,
        associated_gene: fusion.regulatory_element.associated_gene,
        regulatory_class: fusion.regulatory_element.regulatory_class,
        feature_id: fusion.regulatory_element.feature_id,
        feature_location: fusion.regulatory_element.feature_location,
      };
    }
    let formattedFusion: AssayedFusion | CategoricalFusion;
    if (fusion.type === "AssayedFusion") {
      formattedFusion = {
        ...fusion,
        structural_elements: structuralElements,
        regulatory_element: regulatoryElement,
      };
    } else {
      const criticalDomains: FunctionalDomain[] =
        fusion.critical_functional_domains?.map((domain: FunctionalDomain) => ({
          _id: domain._id,
          label: domain.label,
          status: domain.status,
          associated_gene: domain.associated_gene,
          sequence_location: domain.sequence_location,
        }));
      formattedFusion = {
        ...fusion,
        structural_elements: structuralElements,
        regulatory_element: regulatoryElement,
        critical_functional_domains: criticalDomains,
      };
    }
    requestValidatedFusion(formattedFusion);
  }, [fusion]);

  return (
    <>
      {(!validationErrors || validationErrors.length === 0) &&
      validatedFusion ? (
        <Success fusion={validatedFusion} />
      ) : (
        <Invalid validationErrors={validationErrors} />
      )}
    </>
  );
};
