import { useEffect, useState } from 'react';
import { ClientGeneElement } from '../../../../../services/ResponseModels';
import { StructuralElementInputProps } from '../StructuralElementInputProps';
import { GeneAutocomplete } from '../../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { getGeneElement } from '../../../../../services/main';
import ElementInputAccordion from '../StructuralElementInputAccordion';

interface GeneElementInputProps extends StructuralElementInputProps {
  element: ClientGeneElement;
}

const GeneElementInput: React.FC<GeneElementInputProps> = (
  { element, index, handleSave, handleDelete }
) => {
  const [gene, setGene] = useState<string>(element.gene_descriptor?.label || '');
  const [geneText, setGeneText] = useState<string>('');
  const validated = (gene !== '') && (geneText == '');
  const [expanded, setExpanded] = useState<boolean>(!validated);

  useEffect(() => {
    if (validated) buildGeneElement();
  }, [gene, geneText]);

  const buildGeneElement = () => {
    getGeneElement(gene)
      .then(geneElementResponse => {
        if (geneElementResponse.warnings?.length > 0) {
          setGeneText('Gene not found');
        } else {
          const descr = geneElementResponse.element.gene_descriptor;
          const nomenclature = `${descr.label}(${descr.gene_id})`;
          const clientGeneElement: ClientGeneElement = {
            ...geneElementResponse.element,
            element_id: element.element_id,
            element_name: nomenclature,
            hr_name: nomenclature
          };
          handleSave(index, clientGeneElement);
        }
      });
  };

  const inputElements = (
    <GeneAutocomplete
      selectedGene={gene}
      setSelectedGene={setGene}
      geneText={geneText}
      setGeneText={setGeneText}
      style={{ width: 125 }}
    />
  );

  return ElementInputAccordion({
    expanded, setExpanded, element, handleDelete, inputElements, validated
  });
};

export default GeneElementInput;