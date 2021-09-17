import React from 'react';
import {
  Box, FormLabel, 
} from '@material-ui/core';


const RegElementForm: React.FC = () => {

  return (
    <>
      <Box p={1}>
        <FormLabel component="legend">
          Enter the regulatory element:
        </FormLabel>
      </Box>

    </>
  )
}

export default RegElementForm;