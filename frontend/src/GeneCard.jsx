import { React } from 'react';
import {
  TextField,
} from '@material-ui/core';

const GeneCard = ({ componentValues, handleCardChange }) => (
  <>
    <br />
    <TextField id="standard-basic" label="Gene" value={componentValues.chr} onChange={(event) => handleCardChange('gene', event.target.value)} />
  </>
);

export default GeneCard;
