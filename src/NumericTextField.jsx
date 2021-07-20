import { React } from 'react';
import { TextField } from '@material-ui/core';

const NumericTextField = ({
  label, fieldName, value, handleCardChange,
}) => {
  const isInt = value && ((value === '') || (value.match(/^0$|^-?[1-9]\d*(\.\d+)?$/) === null));

  return (
    <TextField
      id="standard-basic"
      label={label}
      value={value}
      onChange={(event) => handleCardChange(fieldName, event.target.value)}
      error={isInt}
      helperText={isInt ? 'Warning: expected integer' : null}
    />
  );
};

export default NumericTextField;
