import { useState } from 'react';
import { Card, CardContent, Button, TextField } from '@material-ui/core';
import { LinkerComponent } from '../../../../../services/ResponseModels';
import { StructuralComponentInputProps } from '../StructCompInputProps';

const LinkerCompInput: React.FC<StructuralComponentInputProps> = (
  { index, id, handleSave, handleCancel }
) => {
  // Linker Sequence
  const [sequence, setSequence] = useState('');
  const linkerError = Boolean(sequence) && sequence.match(/^([aAgGtTcC]+)?$/) === null;

  const buildLinkerComponent = () => {
    const linkerComponent: LinkerComponent = {
      component_type: 'linker_sequence',
      linker_sequence: {
        id: `fusor.sequence:${sequence}`,
        type: 'SequenceDescriptor',
        sequence: sequence,
        residue_type: 'SO:0000348'
      }
    };
    handleSave(index, id, linkerComponent);
  };

  return (
    <Card >
      <CardContent>
        <div className="card-parent">
          <div className="input-parent">
            <TextField
              margin="dense"
              label="Sequence"
              value={sequence}
              onChange={(event) => setSequence(event.target.value.toUpperCase())}
              error={linkerError}
              helperText={linkerError ? 'Warning: must contain only {A, C, G, T}' : null}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  buildLinkerComponent();
                }
              }}
            ></TextField>
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
              disabled={linkerError}
              color="primary"
              onClick={buildLinkerComponent}
            >
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkerCompInput;