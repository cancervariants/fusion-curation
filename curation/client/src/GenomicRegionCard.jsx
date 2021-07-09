import { React } from 'react';
import {
  TextField,
} from '@material-ui/core';

const GenomicRegionCard = ({ componentValues, handleCardChange }) => (
  <>
    <br />
    <TextField id="standard-basic" label="Chromosome" value={componentValues.chr} onChange={(event) => handleCardChange('chr', event.target.value)} />
    <TextField id="standard-basic" label="Strand" value={componentValues.strand} onChange={(event) => handleCardChange('strand', event.target.value)} />
    <br />
    <TextField id="standard-basic" label="Start Position" value={componentValues.start_pos} onChange={(event) => handleCardChange('start_pos', event.target.value)} />
    <TextField id="standard-basic" label="End Position" value={componentValues.end_pos} onChange={(event) => handleCardChange('end_pos', event.target.value)} />
  </>
);

export default GenomicRegionCard;
