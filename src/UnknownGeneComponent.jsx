import { React } from 'react';
import { TextField } from '@material-ui/core';
import NumericTextField from './NumericTextField';

const UnknownGeneComponent = ({ componentValues, handleCardChange }) => (
  <>
    <TextField
      id="standard-basic"
      label="Chromosome"
      value={componentValues.chr}
      onChange={(event) => handleCardChange('chr', event.target.value)}
    />
    <NumericTextField
      label="Start"
      fieldName="start"
      value={componentValues.start}
      handleCardChange={handleCardChange}
    />
    <NumericTextField
      label="End"
      fieldName="end"
      value={componentValues.end}
      handleCardChange={handleCardChange}
    />
  </>
);

export default UnknownGeneComponent;
