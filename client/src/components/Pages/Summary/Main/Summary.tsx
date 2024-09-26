import "./Summary.scss";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import React, { useContext, useEffect, useState } from "react";

import {
  AssayedFusionElements,
  CategoricalFusionElements,
  ClientElementUnion,
  ElementUnion,
  validateFusion,
} from "../../../../services/main";
import {
  AssayedFusion,
  CategoricalFusion,
  FormattedAssayedFusion,
  FormattedCategoricalFusion,
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
  setVisibleTab: CallableFunction;
}

export const Summary: React.FC<Props> = ({ setVisibleTab }) => {
  const [validatedFusion, setValidatedFusion] = useState<
    AssayedFusion | CategoricalFusion | null
  >(null);
  const [formattedFusion, setFormattedFusion] = useState<
    FormattedAssayedFusion | FormattedCategoricalFusion | null
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
          gene: element.gene,
        };
        return geneElement;
      case "LinkerSequenceElement":
        const linkerElement: LinkerElement = {
          type: element.type,
          linkerSequence: element.linkerSequence,
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
          exonStart: element.exonStart,
          exonStartOffset: element.exonStartOffset,
          exonEnd: element.exonEnd,
          exonEndOffset: element.exonEndOffset,
          gene: element.gene,
          elementGenomicStart: element.elementGenomicStart,
          elementGenomicEnd: element.elementGenomicEnd,
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
    formattedFusion: FormattedAssayedFusion | FormattedCategoricalFusion
  ) => {
    // make request
    validateFusion(formattedFusion).then((response) => {
      if (response.warnings && response.warnings?.length > 0) {
        setValidationErrors(response.warnings);
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
   * fix expected casing for fusor fusion constructors,
   * transmit to validation endpoint, and update local copy.
   */
  useEffect(() => {
    const structure: ElementUnion[] = fusion.structure?.map(
      (element: ClientElementUnion) => fusorifyStructuralElement(element)
    );
    let regulatoryElement: RegulatoryElement | null = null;
    if (fusion.regulatoryElement) {
      regulatoryElement = {
        type: fusion.regulatoryElement.type,
        associatedGene: fusion.regulatoryElement.associatedGene,
        regulatoryClass: fusion.regulatoryElement.regulatoryClass,
        featureId: fusion.regulatoryElement.featureId,
        featureLocation: fusion.regulatoryElement.featureLocation,
      };
    }
    let formattedFusion: FormattedAssayedFusion | FormattedCategoricalFusion;
    if (fusion.type === "AssayedFusion") {
      formattedFusion = {
        fusion_type: fusion.type,
        structure: structure as AssayedFusionElements[],
        causative_event: fusion.causativeEvent,
        assay: fusion.assay,
        regulatory_element: regulatoryElement,
        reading_frame_preserved: fusion.readingFramePreserved,
      };
    } else {
      formattedFusion = {
        fusion_type: fusion.type,
        structure: structure as CategoricalFusionElements[],
        regulatory_element: regulatoryElement,
        critical_functional_domains: fusion.criticalFunctionalDomains,
        reading_frame_preserved: fusion.readingFramePreserved,
      };
    }
    requestValidatedFusion(formattedFusion);
    setFormattedFusion(formattedFusion);
  }, [fusion]);

  return (
    <>
      {(!validationErrors || validationErrors.length === 0) &&
      formattedFusion &&
      validatedFusion ? (
        <Success fusion={formattedFusion} />
      ) : (
        <>
          {validationErrors && validationErrors.length > 0 ? (
            <Invalid
              validationErrors={validationErrors}
              setVisibleTab={setVisibleTab}
            />
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
};
