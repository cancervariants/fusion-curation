import React from 'react';
import {
  Box, Grid, FormLabel, Paper,
} from '@material-ui/core';


const CTForm: React.FC = () => {

  const all = {'Transcript Segment': ['Transcript', 'Starting Exon', 'Ending Exon', 'Gene'],
  'Genomic Region': ['Chromosome', 'Strand', 'Start Position', 'End Position'],
  'Linker': ['Sequence'],
  'Gene': ['Gene']
}

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

export default CTForm;