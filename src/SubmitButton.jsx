import { React } from 'react';
import { Box, Button } from '@material-ui/core';

const SubmitButton = ({ handler }) => (
  <Box p={1}>
    <Button variant="contained" color="primary" onClick={handler}>Submit</Button>
  </Box>
);

export default SubmitButton;
