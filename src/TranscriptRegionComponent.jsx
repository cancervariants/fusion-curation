import { React } from 'react';
import { TextField } from '@material-ui/core';

// TODO refactor each component into a render() call to cut down on repeated code
const TranscriptRegionComponent = ({ componentValues, handleCardChange }) => {
  /**
   * Render component for a text field that accepts only numerals as input
   * @param {string} label User-facing field label
   * @param {string} fieldName internal state property name corresponding to this TextField
   * @returns {JSX.Element} component template for a numeric-only text field
   */
  const renderNumeric = (label, fieldName) => {
    const value = componentValues[fieldName];
    const isInt = value && ((value === '') || (value.match(/^[0-9]+$/) === null));
    return (
      <TextField
        id="standard-basic"
        label={label}
        value={value}
        onChange={(event) => handleCardChange(fieldName, event.target.value)}
        error={isInt}
        helperText={isInt ? 'Warning: expected whole number' : null}
      />
    );
  };

  return (
    <>
      <br />
      <TextField
        id="standard-basic"
        label="Transcript"
        value={componentValues.transcript}
        onChange={(event) => handleCardChange('transcript', event.target.value)}
      />
      {componentValues.exon_start || componentValues.exon_end ? <br /> : null}
      {renderNumeric('Starting Exon', 'exon_start')}
      {componentValues.exon_start ? renderNumeric('Starting Exon Offset', 'exon_start_offset') : null}
      {renderNumeric('Ending Exon', 'exon_end')}
      {componentValues.exon_end ? renderNumeric('Ending Exon Offset', 'exon_end_offset') : null}
      <br />
      <TextField id="standard-basic" label="Gene" value={componentValues.gene_symbol} onChange={(event) => handleCardChange('gene_symbol', event.target.value)} />
    </>
  );
};

export default TranscriptRegionComponent;
