import { useState } from 'react';
import { Card, CardContent, Button, TextField } from '@material-ui/core';
import { StructuralComponentInputProps } from '../StructCompInputProps';
import { getTemplatedSequenceComponent } from '../../../../../services/main';

const TemplatedSequenceCompInput: React.FC<StructuralComponentInputProps> = (
  { index, id, handleCancel, handleSave }
) => {
  const [strand, setStrand] = useState('');
  const [chromosome, setChromosome] = useState('');
  const [startPosition, setStartPosition] = useState('');
  const [endPosition, setEndPosition] = useState('');

  const buildTemplatedSequenceComponent = () => {
    getTemplatedSequenceComponent(chromosome, strand, startPosition, endPosition)
      .then(templatedSequenceResponse => {
        if (templatedSequenceResponse.warnings.length > 0) {
          // TODO error handling
          return;
        } else {
          handleSave(index, templatedSequenceResponse.component);
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