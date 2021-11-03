import { useState } from 'react';
import { Card, CardContent, Button } from '@material-ui/core';
import { GeneAutocomplete } from '../../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { getGeneComponent } from '../../../../../services/main';
import { StructuralComponentInputProps } from '../StructCompInputProps';

const GeneCompInput: React.FC<StructuralComponentInputProps> = (
  { index, id, handleCancel, handleSave }
) => {
  const [gene, setGene] = useState<string>('');
  const [geneError, setGeneError] = useState('');

  const buildGeneComponent = (term: string) => {
    getGeneComponent(term)
      .then(geneComponentResponse => {
        if (geneComponentResponse.warnings?.length > 0) {
          setGeneError('Gene not found');
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
