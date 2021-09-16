import { React } from 'react';
import { FormControlLabel, Radio } from '@material-ui/core';

const RadioOption = ({ option, stateValue, stateFunction }) => (
  <FormControlLabel
    value={option.toLowerCase()}
    control={<Radio />}
    label={option}
    onClick={() => stateFunction(stateValue, option)}
  />
);

export default RadioOption;
