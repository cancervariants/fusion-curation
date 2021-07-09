import { React } from 'react';
import {
  TextField,
} from '@material-ui/core';

const LinkerSequenceCard = ({ componentValues, handleCardChange }) => (
  <>
    <br />
    <TextField id="standard-basic" label="Sequence" value={componentValues.sequence} onChange={(event) => handleCardChange('sequence', event.target.value)} />
  </>
);

export default LinkerSequenceCard;
