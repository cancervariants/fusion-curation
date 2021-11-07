import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, Button, TextField } from '@material-ui/core';
import { StructuralComponentInputProps } from '../StructCompInputProps';
import { getTemplatedSequenceComponent } from '../../../../../services/main';
import { FusionContext } from '../../../../../global/contexts/FusionContext';

const TemplatedSequenceCompInput: React.FC<StructuralComponentInputProps> = (
  { index, id, handleCancel, handleSave }
) => {
  const [chromosome, setChromosome] = useState('');
  const [strand, setStrand] = useState('');
  const [startPosition, setStartPosition] = useState('');
  const [endPosition, setEndPosition] = useState('');

  const { fusion, setFusion } = useContext(FusionContext);
  useEffect(() => {
    const prevValues = fusion.structural_components?.filter(comp => comp.component_id === id)[0];
    if (prevValues) {
      const fusionCopy = Object.assign({}, fusion);
      fusionCopy.structural_components.splice(fusion.structural_components.indexOf(prevValues), 1);
      setFusion(fusionCopy);
      setChromosome(prevValues.region.id.split(':')[1]);
      setStrand(prevValues.strand);
      setStartPosition(prevValues.region.location.interval.start.value);
      setEndPosition(prevValues.region.location.interval.end.value);
    }
  }, []);

  const buildTemplatedSequenceComponent = () => {
    getTemplatedSequenceComponent(chromosome, strand, startPosition, endPosition)
      .then(templatedSequenceResponse => {
        if (templatedSequenceResponse.warnings.length > 0) {
          // TODO error handling
          return;
        } else {
          handleSave(index, id, templatedSequenceResponse.component);
        }
      });
  };

  return (
    <Card >
      <CardContent>
        <div className="card-parent">
          <div className="input-parent">
            <div className="top-inputs">
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                value={chromosome}
                onChange={(event) => setChromosome(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTemplatedSequenceComponent();
                  }
                }}
                label="Chromosome"
              />
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                label="Strand"
                value={strand}
                onChange={(event) => setStrand(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTemplatedSequenceComponent();
                  }
                }}
              />
            </div>
            <div className="bottom-inputs">
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                label="Start Position"
                value={startPosition}
                onChange={(event) => setStartPosition(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTemplatedSequenceComponent();
                  }
                }}
              >
              </TextField>
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                label="End Position"
                value={endPosition}
                onChange={(event) => setEndPosition(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTemplatedSequenceComponent();
                  }
                }}
              ></TextField>
            </div>
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
              disabled={
                chromosome === '' || strand === '' || (startPosition === '' && endPosition === '')
              }
              onClick={() => buildTemplatedSequenceComponent()}
            >
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatedSequenceCompInput;