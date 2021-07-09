import { React } from 'react';
import { Button, ButtonGroup } from '@material-ui/core';

const AddComponentButton = ({ clickHandler }) => (
  <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
    <Button onClick={() => clickHandler('transcript_region')}>Add Transcript Region</Button>
    <Button onClick={() => clickHandler('genomic_region')}>Add Genomic Region</Button>
    <Button onClick={() => clickHandler('linker_sequence')}>Add Linker</Button>
  </ButtonGroup>
);

export default AddComponentButton;
