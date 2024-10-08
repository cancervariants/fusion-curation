import { useEffect, useState } from "react";
import {
  ClientGeneElement,
  NomenclatureResponse,
} from "../../../../../services/ResponseModels";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import { GeneAutocomplete } from "../../../../main/shared/GeneAutocomplete/GeneAutocomplete";
import {
  getGeneElement,
  getGeneNomenclature,
} from "../../../../../services/main";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";
import React from "react";

interface GeneElementInputProps extends StructuralElementInputProps {
  element: ClientGeneElement;
}

const GeneElementInput: React.FC<GeneElementInputProps> = ({
  element,
  handleSave,
  handleDelete,
  icon,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [gene, setGene] = useState<string>(element.gene?.label || "");
  const [geneText, setGeneText] = useState<string>("");
  const validated = gene !== "" && geneText == "";
  const [expanded, setExpanded] = useState<boolean>(!validated);
  const [pendingResponse, setPendingResponse] = useState(false);
  const geneNotFound = "Gene not found";

  useEffect(() => {
    if (validated) buildGeneElement();
  }, [gene, geneText]);

  const buildGeneElement = () => {
    setPendingResponse(true);
    getGeneElement(gene).then((geneElementResponse) => {
      if (
        geneElementResponse.warnings &&
        geneElementResponse.warnings.length > 0
      ) {
        setGeneText(geneNotFound);
        setErrors([geneNotFound]);
        setPendingResponse(false);
      } else if (
        geneElementResponse.element &&
        geneElementResponse.element.gene
      ) {
        setErrors([]);
        getGeneNomenclature(geneElementResponse.element).then(
          (nomenclatureResponse: NomenclatureResponse) => {
            if (
              !nomenclatureResponse.warnings &&
              nomenclatureResponse.nomenclature
            ) {
              const clientGeneElement: ClientGeneElement = {
                ...geneElementResponse.element,
                elementId: element.elementId,
                nomenclature: nomenclatureResponse.nomenclature,
              };
              handleSave(clientGeneElement);
              setPendingResponse(false);
            }
          }
        );
      }
    });
  };

  const inputElements = (
    <GeneAutocomplete
      gene={gene}
      setGene={setGene}
      geneText={geneText}
      setGeneText={setGeneText}
      tooltipDirection="left"
    />
  );

  return StructuralElementInputAccordion({
    expanded,
    setExpanded,
    element,
    handleDelete,
    inputElements,
    validated,
    errors,
    icon,
    pendingResponse,
  });
};

export default GeneElementInput;
