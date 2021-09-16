import { React } from 'react';
import { TextField } from '@material-ui/core';
import NumericTextField from './NumericTextField';

const TranscriptSegmentComponent = ({ componentValues, handleCardChange }) => (
  <>
    <TextField
      id="standard-basic"
      label="Transcript"
      value={componentValues.transcript}
      onChange={(event) => handleCardChange('transcript', event.target.value)}
    />
    {componentValues.exon_start || componentValues.exon_end ? <br /> : null}
    <NumericTextField
      label="Starting Exon"
      fieldName="exon_start"
      value={componentValues.exon_start}
      handleCardChange={handleCardChange}
    />
    {componentValues.exon_start
      ? (
        <NumericTextField
          label="Starting Exon Offset"
          fieldName="exon_start_offset"
          value={componentValues.exon_start_offset}
          handleCardChange={handleCardChange}
        />
      )
      : null}
    <NumericTextField
      label="Ending Exon"
      fieldName="exon_end"
      value={componentValues.exon_end}
      handleCardChange={handleCardChange}
    />
    {componentValues.exon_end
      ? (
        <NumericTextField
          label="Ending Exon Offset"
          fieldName="exon_end_offset"
          value={componentValues.exon_end_offset}
          handleCardChange={handleCardChange}
        />
      )
      : null}
    <br />
    <TextField
      id="standard-basic"
      label="Gene"
      value={componentValues.gene_symbol}
      onChange={(event) => handleCardChange('gene_symbol', event.target.value)}
    />
  </>
);

export default TranscriptSegmentComponent;
