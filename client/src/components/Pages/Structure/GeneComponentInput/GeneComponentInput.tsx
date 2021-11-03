import { useState } from 'react';
import { Card, CardContent, Button } from '@material-ui/core';
import { GeneAutocomplete } from '../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { getGeneComponent } from '../../../../services/main';

interface GeneComponentProps {
  index: number,
  uuid: string,
  handleCancel: CallableFunction,
  handleSave: CallableFunction
}

const GeneComponentInput: React.FC<GeneComponentProps> = (
  { index, uuid, handleCancel, handleSave }
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
          handleSave(index, geneComponentResponse.component);
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
              onClick={() => handleCancel(uuid)}
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

export default GeneComponentInput;
