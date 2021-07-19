import { React } from 'react';
import {
  TextField,
} from '@material-ui/core';

const GeneComponent = ({ componentValues, handleCardChange }) => (
  <>
    <br />
    <TextField id="standard-basic" label="Gene" value={componentValues.gene_symbol} onChange={(event) => handleCardChange('gene_symbol', event.target.value)} />
  </>
);

export default GeneComponent;
