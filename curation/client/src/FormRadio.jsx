import { React } from 'react';
import {
  Box, FormControl, FormLabel, RadioGroup,
} from '@material-ui/core';
import RadioOption from './RadioOption';

const FormRadio = ({ name, prompt, state }) => (
  <Box p={1}>
    <FormControl component="fieldset">
      <FormLabel component="legend">{prompt}</FormLabel>
      <RadioGroup aria-label={name} name={name}>
        {
          state.options.map((option) => (
            <RadioOption
              key={option}
              option={option}
              stateValue={state.state}
              stateFunction={state.stateFunction}
            />
          ))
        }
      </RadioGroup>
    </FormControl>
    <p />
  </Box>
);

export default FormRadio;
