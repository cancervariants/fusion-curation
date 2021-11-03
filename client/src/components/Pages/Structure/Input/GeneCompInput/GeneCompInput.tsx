import { useContext, useEffect, useState } from 'react';
import { Card, CardContent, Button } from '@material-ui/core';
import { GeneAutocomplete } from '../../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { getGeneComponent } from '../../../../../services/main';
import { StructuralComponentInputProps } from '../StructCompInputProps';
import { ClientGeneComponent } from '../../../../../services/ResponseModels';
import { FusionContext } from '../../../../../global/contexts/FusionContext';

interface GeneComponentInputProps extends StructuralComponentInputProps {
  prevValues: ClientGeneComponent
}

const GeneCompInput: React.FC<GeneComponentInputProps> = (
  { index, id, handleCancel, handleSave }
) => {
  const [gene, setGene] = useState<string>('');
  const [geneText, setGeneText] = useState<string>('');
  const [geneError, setGeneError] = useState<boolean>(false);

  // Fusion object constructed throughout app lifecycle
  const { fusion, setFusion } = useContext(FusionContext);
  useEffect(() => {
    const prevValues = fusion.structural_components?.filter(comp => comp.component_id === id)[0];
    if (prevValues) {
      const fusionCopy = Object.assign({}, fusion);
      fusionCopy.structural_components.splice(fusion.structural_components.indexOf(prevValues), 1);
      setFusion(fusionCopy);
      const prevInput = prevValues.gene_descriptor.id.split(':')[1];
      setGene(prevInput);
    }
  }, []);

  const buildGeneComponent = (term: string) => {
    getGeneComponent(term)
      .then(geneComponentResponse => {
        if (geneComponentResponse.warnings?.length > 0) {
          setGeneText('Gene not found');
          setGeneError(true);
          return;
        } else {
          handleSave(index, id, geneComponentResponse.component);
        }
      });
  };

  return (
    <Card >
      <CardContent>
        <div className="card-parent">
          <div className="input-parent">
            <GeneAutocomplete
              selectedGene={gene}
              setSelectedGene={setGene}
              geneText={geneText}
              setGeneText={setGeneText}
              geneError={geneError}
              setGeneError={setGeneError}
              style={{ width: 125 }}
            />
          </div>
          <div className="buttons">
            <Button
              style={{ margin: '8px' }}
              variant="outlined"
              color="secondary"
              onClick={() => handleCancel(id)}
            >
              Cancel
            </Button>
            <Button
              style={{ margin: '8px' }}
              variant="outlined"
              color="primary"
              onClick={() => buildGeneComponent(gene)}
            >
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneCompInput;
