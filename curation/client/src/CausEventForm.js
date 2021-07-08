import { React } from 'react';
import {
  Box, FormLabel, FormControl, FormControlLabel, RadioGroup, Radio,
} from '@material-ui/core';

const CausEventForm = () => (
  <>
    <Box p={1}>
      <form noValidate autoComplete="off">
        <FormControl component="fieldset">
          <FormLabel component="legend">
            Record event type:
          </FormLabel>
          <RadioGroup aria-label="event-type" name="event-type">
            <FormControlLabel value="rearrangement" control={<Radio />} label="Rearrangement" />
            <FormControlLabel value="read-through" control={<Radio />} label="Read-through" />
            <FormControlLabel value="trans-splicing" control={<Radio />} label="Trans-splicing" />
          </RadioGroup>
        </FormControl>
      </form>
    </Box>
  </>
);

export default CausEventForm;
