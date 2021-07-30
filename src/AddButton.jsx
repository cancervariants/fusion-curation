import { React } from 'react';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const AddButton = ({ label, clickHandler }) => (
  <Button
    variant="contained"
    color="primary"
    onClick={() => clickHandler()}
    startIcon={<AddIcon />}
  >
    Add
    {label}
  </Button>
);

export default AddButton;
