import { React } from 'react';
import { TextField } from '@material-ui/core';

const TranscriptRegionCard = ({ componentValues, handleCardChange }) => (
  <>
    <br />
    <TextField id="standard-basic" label="Transcript" value={componentValues.transcript} onChange={(event) => handleCardChange('transcript', event.target.value)} />
    <TextField id="standard-basic" label="Starting Exon" value={componentValues.exon_start} onChange={(event) => handleCardChange('start_exon', event.target.value)} />
    <TextField id="standard-basic" label="Ending Exon" value={componentValues.exon_end} onChange={(event) => handleCardChange('end_exon', event.target.value)} />
    <br />
    <TextField id="standard-basic" label="Gene" value={componentValues.gene_symbol} onChange={(event) => handleCardChange('gene_symbol', event.target.value)} />
    <TextField id="standard-basic" label="Chromosome" value={componentValues.chr} onChange={(event) => handleCardChange('chr', event.target.value)} />
    <TextField id="standard-basic" label="Position" value={componentValues.pos} onChange={(event) => handleCardChange('pos', event.target.value)} />
  </>
);

export default TranscriptRegionCard;
