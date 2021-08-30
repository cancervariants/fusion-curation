import React from 'react';
import {
  Box, Grid, FormLabel, Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {CTInput} from './CTInput';


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
          Enter chimeric transcript components:
        </FormLabel>
      </Box>
      {
        Object.entries(all).map(([key, value]) => {
          return <CTInput title={key} key={key} inputs={value} />
        })
      }
    </>
  )
}

export default CTForm;