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

interface GeneElementInputProps extends StructuralElementInputProps {
  element: ClientGeneElement;
}

const GeneElementInput: React.FC<GeneElementInputProps> = ({
  element,
  index,
  handleSave,
  handleDelete,
  icon,
}) => {
  const [gene, setGene] = useState<string>(element.gene?.label || "");
  const [geneText, setGeneText] = useState<string>("");
  const validated = gene !== "" && geneText == "";
  const [expanded, setExpanded] = useState<boolean>(!validated);
  const [pendingResponse, setPendingResponse] = useState(false);

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
        setGeneText("Gene not found");
      } else if (
        geneElementResponse.element &&
        geneElementResponse.element.gene
      ) {
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
              handleSave(index, clientGeneElement);
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
      style={{ width: 125 }}
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
    icon,
    pendingResponse,
  });
};

export default GeneElementInput;
