import { React } from 'react';
import {
  Box, FormControl, FormLabel, RadioGroup,
} from '@material-ui/core';
import RadioOption from './RadioOption';

/**
 * Construct form providing radio response options
 * @param {object} props Component props
 * @param {string} name Field name
 * @param {string} prompt Form label prompting user response
 * @param {object} state Object containing currently selected field and setter function
 * @returns {JSX.Element} component template
 */
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
