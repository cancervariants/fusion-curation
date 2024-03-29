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
  >(fusion.regulatory_element);

  const [elementClass, setElementClass] = useState<RegulatoryClass | "default">(
    regElement?.regulatory_class || "default"
  );
  const [gene, setGene] = useState<string>(
    regElement?.associated_gene?.label || ""
  );
  const [geneText, setGeneText] = useState<string>("");

  const validated = gene !== "" && geneText == "" && elementClass !== "default";
  const [expanded, setExpanded] = useState<boolean>(!validated);

  useEffect(() => {
    if (validated) handleAdd();
  }, [gene, geneText, elementClass]);

  const handleAdd = () => {
    if (elementClass === "default") return;
    getRegulatoryElement(elementClass, gene).then((reResponse) => {
      if (reResponse.warnings && reResponse.warnings.length > 0) {
        throw new Error(reResponse.warnings[0]);
      }
      getRegElementNomenclature(reResponse.regulatory_element).then(
        (nomenclatureResponse) => {
          if (
            nomenclatureResponse.warnings &&
            nomenclatureResponse.warnings.length > 0
          ) {
            throw new Error(nomenclatureResponse.warnings[0]);
          }
          const newRegElement: ClientRegulatoryElement = {
            ...reResponse.regulatory_element,
            display_class: regulatoryClassItems[elementClass][1],
            nomenclature: nomenclatureResponse.nomenclature,
          };
          setRegElement(newRegElement);
          setFusion({ ...fusion, ...{ regulatory_element: newRegElement } });
        }
      );
    });
  };

  const handleDeleteElement = () => {
    delete fusion.regulatory_element;
    const cloneFusion = { ...fusion };
    setRegElement(undefined);
    setFusion(cloneFusion);
    setElementClass("default");
    setGene("");
    setGeneText("");
  };

  const inputElements = (
    <>
      <RegElementForm
        regulatoryClassItems={regulatoryClassItems}
        elementClass={elementClass}
        setElementClass={setElementClass}
        gene={gene}
        setGene={setGene}
        geneText={geneText}
        setGeneText={setGeneText}
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
    icon,
  });
};

export default RegulatoryElementInput;
