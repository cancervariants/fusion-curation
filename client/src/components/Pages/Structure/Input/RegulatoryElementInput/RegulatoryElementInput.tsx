import React, { useState, useEffect, useContext } from "react";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import {
  ClientRegulatoryElement,
  RegulatoryClass,
} from "../../../../../services/ResponseModels";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";
import {
  getRegElementNomenclature,
  getRegulatoryElement,
} from "../../../../../services/main";
import { FusionContext } from "../../../../../global/contexts/FusionContext";
import RegElementForm from "../../RegElement/RegElementForm/RegElementForm";

/**
 * Lookup table used to map raw regulatory class enum values to options for the class
 * drop-down menu and for display purposes. The boolean is for disabling selectability
 * on the drop-down menu, and the string is the displayed value.
 * It's not clear to me if Typescript can check these values for correctness if they change,
 * so any changes to the Pydantic RegulatoryClass class need to be reflected in the keys here.
 */
const regulatoryClassItems = {
  default: [true, ""],
  attenuator: [false, "Attenuator"],
  caat_signal: [false, "CAAT signal"],
  enhancer: [false, "Enhancer"],
  enhancer_blocking_element: [false, "Enhancer Blocking Element"],
  gc_signal: [false, "GC Signal"],
  imprinting_control_region: [false, "Imprinting Control Region"],
  insulator: [false, "Insulator"],
  minus_35_signal: [false, "-35 Signal"],
  minus_10_signal: [false, "-10 Signal"],
  polya_signal_sequence: [false, "PolyA Signal Sequence"],
  promoter: [false, "Promoter"],
  response_element: [false, "Response Element"],
  ribosome_binding_site: [false, "Ribosome Binding Site"],
  riboswitch: [false, "Riboswitch"],
  silencer: [false, "Silencer"],
  tata_box: [false, "TATA Box"],
  teminator: [false, "Terminator"],
  other: [false, "Other"],
};

interface RegulatoryElementInputProps extends StructuralElementInputProps {
  element: ClientRegulatoryElement;
}

const RegulatoryElementInput: React.FC<RegulatoryElementInputProps> = ({
  element,
  icon,
}) => {
  const { fusion, setFusion } = useContext(FusionContext);
  const [regElement, setRegElement] = useState<
    ClientRegulatoryElement | undefined
  >(fusion.regulatoryElement);

  const [elementClass, setElementClass] = useState<RegulatoryClass | "default">(
    regElement?.regulatoryClass || "default"
  );
  const [featureId, setFeatureId] = useState<string>(
    regElement?.featureId || ""
  );
  const [gene, setGene] = useState<string>(
    regElement?.associatedGene?.name || ""
  );
  const [geneText, setGeneText] = useState<string>("");

  const [chromosome, setChromosome] = useState<string>(
    regElement?.featureLocation?.name || ""
  );
  const [genomicStart, setGenomicStart] = useState<string>(() => {
    const start = regElement?.featureLocation?.start;

    if (typeof start === "number") {
      return String(start + 1);
    }

    return "";
  });
  const [genomicEnd, setGenomicEnd] = useState<string>(() => {
    const end = regElement?.featureLocation?.end;

    if (typeof end == "number") {
      return String(end);
    }
    return "";
  });

  const validated =
    (gene !== "" && geneText == "" && elementClass !== "default") ||
    (chromosome !== "" && genomicStart !== "" && genomicEnd !== "");
  const [expanded, setExpanded] = useState<boolean>(!validated);

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (validated) handleAdd();
  }, [
    gene,
    geneText,
    elementClass,
    featureId,
    chromosome,
    genomicStart,
    genomicEnd,
  ]);

  const handleAdd = () => {
    if (elementClass === "default") return;
    getRegulatoryElement(
      elementClass,
      gene,
      featureId,
      chromosome,
      genomicStart,
      genomicEnd
    ).then((reResponse) => {
      if (reResponse.warnings && reResponse.warnings.length > 0) {
        setErrors(reResponse.warnings);
        return;
      }
      if (reResponse.regulatoryElement) {
        getRegElementNomenclature(reResponse.regulatoryElement).then(
          (nomenclatureResponse) => {
            if (
              nomenclatureResponse.warnings &&
              nomenclatureResponse.warnings.length > 0
            ) {
              setErrors(nomenclatureResponse.warnings);
              return;
            }
            setErrors([]);
            const newRegElement: ClientRegulatoryElement = {
              ...reResponse.regulatoryElement,
              elementId: element.elementId,
              displayClass: regulatoryClassItems[elementClass][1],
              nomenclature: nomenclatureResponse.nomenclature || "",
            };
            setRegElement(newRegElement);
            setFusion({ ...fusion, ...{ regulatoryElement: newRegElement } });
          }
        );
      }
    });
  };

  const handleDeleteElement = () => {
    delete fusion.regulatoryElement;
    const cloneFusion = { ...fusion };
    setRegElement(undefined);
    setFusion(cloneFusion);
    setElementClass("default");
    setFeatureId("");
    setGene("");
    setGeneText("");
    setChromosome("");
    setGenomicStart("");
    setGenomicEnd("");
    setErrors([]);
  };

  const inputElements = (
    <>
      <RegElementForm
        regulatoryClassItems={regulatoryClassItems}
        elementClass={elementClass}
        setElementClass={setElementClass}
        featureId={featureId}
        setFeatureId={setFeatureId}
        gene={gene}
        setGene={setGene}
        geneText={geneText}
        setGeneText={setGeneText}
        chromosome={chromosome}
        setChromosome={setChromosome}
        genomicStart={genomicStart}
        setGenomicStart={setGenomicStart}
        genomicEnd={genomicEnd}
        setGenomicEnd={setGenomicEnd}
      />
    </>
  );

  return StructuralElementInputAccordion({
    expanded,
    setExpanded,
    element,
    handleDelete: handleDeleteElement,
    inputElements,
    validated,
    errors,
    icon,
  });
};

export default RegulatoryElementInput;
