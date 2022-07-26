import { useEffect, useState } from 'react';
import { ClientGeneComponent } from '../../../../../services/ResponseModels';
import { StructuralComponentInputProps } from '../StructCompInputProps';
import { GeneAutocomplete } from '../../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { getGeneComponent } from '../../../../../services/main';
import CompInputAccordion from '../CompInputAccordion';

interface GeneComponentInputProps extends StructuralComponentInputProps {
  component: ClientGeneComponent;
}

const GeneCompInput: React.FC<GeneComponentInputProps> = (
  { component, index, handleSave, handleDelete }
) => {
  const [gene, setGene] = useState<string>(component.gene_descriptor?.label || '');
  const [geneText, setGeneText] = useState<string>('');
  const validated = (gene !== '') && (geneText == '');
  const [expanded, setExpanded] = useState<boolean>(!validated);

  useEffect(() => {
    if (validated) buildGeneComponent();
  }, [gene, geneText]);

  const buildGeneComponent = () => {
    getGeneComponent(gene)
      .then(geneComponentResponse => {
        if (geneComponentResponse.warnings?.length > 0) {
          setGeneText('Gene not found');
        } else {
          const descr = geneComponentResponse.component.gene_descriptor;
          const nomenclature = `${descr.label}(${descr.gene_id})`;
          const clientGeneComponent: ClientGeneComponent = {
            ...geneComponentResponse.component,
            component_id: component.component_id,
            component_name: nomenclature,
            hr_name: nomenclature
          };
          handleSave(index, clientGeneComponent);
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

  return CompInputAccordion({
    expanded, setExpanded, component, handleDelete, inputElements, validated
  });
};

export default GeneCompInput;