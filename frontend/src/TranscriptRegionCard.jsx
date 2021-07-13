import { React } from 'react';
import { TextField } from '@material-ui/core';

const TranscriptRegionCard = ({ componentValues, handleCardChange }) => (
  <>
    <br />
    <TextField id="standard-basic" label="Transcript" value={componentValues.transcript} onChange={(event) => handleCardChange('transcript', event.target.value)} />
    { componentValues.exon_start || componentValues.exon_end ? <br /> : null}
    <TextField id="standard-basic" label="Starting Exon" value={componentValues.exon_start} onChange={(event) => handleCardChange('exon_start', event.target.value)} />
    {
      componentValues.exon_start
        ? (
          <TextField
            id="standard-basic"
            label="Starting Exon Offset"
            value={componentValues.exon_start_offset}
            onChange={(event) => handleCardChange('exon_start_offset', event.target.value)}
          />
        )
        : null
    }
    <TextField id="standard-basic" label="Ending Exon" value={componentValues.exon_end} onChange={(event) => handleCardChange('exon_end', event.target.value)} />
    {
      componentValues.exon_end
        ? (
          <TextField
            id="standard-basic"
            label="Ending Exon Offset"
            value={componentValues.exon_end_offset}
            onChange={(event) => handleCardChange('exon_end_offset', event.target.value)}
          />
        )
        : null
    }
    <br />
    <TextField id="standard-basic" label="Gene" value={componentValues.gene_symbol} onChange={(event) => handleCardChange('gene_symbol', event.target.value)} />
  </>
);

export default TranscriptRegionCard;
