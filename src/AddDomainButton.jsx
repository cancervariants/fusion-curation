import { React } from 'react';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const AddDomainButton = ({ clickHandler }) => (
  <Button
    variant="contained"
    color="primary"
    onClick={() => clickHandler()}
    startIcon={<AddIcon />}
  >
    Add Domain
  </Button>
);

export default AddDomainButton;
