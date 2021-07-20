import { React } from 'react';
import {
  TextField,
} from '@material-ui/core';
import NumericTextField from './NumericTextField';

// todo do numeric field checks here
const GenomicRegionComponent = ({ componentValues, handleCardChange }) => (
  <>
    <TextField id="standard-basic" label="Chromosome" value={componentValues.chr} onChange={(event) => handleCardChange('chr', event.target.value)} />
    <TextField id="standard-basic" label="Strand" value={componentValues.strand} onChange={(event) => handleCardChange('strand', event.target.value)} />
    <br />
    <NumericTextField
      label="Start Position"
      fieldName="start_pos"
      value={componentValues.start_pos}
      handleCardChange={handleCardChange}
    />
    <NumericTextField
      label="End Position"
      fieldName="end_pos"
      value={componentValues.end_pos}
      handleCardChange={handleCardChange}
    />
  </>
);

export default GenomicRegionComponent;
