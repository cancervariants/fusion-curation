import { React } from 'react';
import {
  TextField,
} from '@material-ui/core';

const LinkerSequenceComponent = ({ componentValues, handleCardChange }) => {
  const containsOnlyBases = componentValues.sequence && componentValues.sequence.match(/^([aAgGtTcC]+)?$/) === null;

  return (
    <TextField
      id="standard-basic"
      label="Sequence"
      value={componentValues.sequence}
      onChange={(event) => handleCardChange('sequence', event.target.value)}
      error={containsOnlyBases}
      helperText={containsOnlyBases ? 'Warning: must contain only {A, C, G, T}' : null}
    />
  );
};

export default LinkerSequenceComponent;
