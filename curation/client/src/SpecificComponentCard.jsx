import { React } from 'react';
import {
  Box, Paper, FormControl, Select, MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Delete from '@material-ui/icons/Delete';
import TranscriptRegionCard from './TranscriptRegionCard';
import GenomicRegionCard from './GenomicRegionCard';
import LinkerSequenceCard from './LinkerSequenceCard';

// todo move up one and send as props?
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const SpecificComponentCard = ({ componentType, componentValues, handleCardChange }) => {
  // TODO (?) use a render() subcommand instead of if/thens for each card type

  const classes = useStyles();

  return (
    <Box p={1}>
      <Paper elevation={2}>
        <Box p={1}>
          <FormControl className={classes.formControl}>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={componentType}
              onChange={(event) => handleCardChange('componentType', event.target.value)}
            >
              <MenuItem value="transcript_region">Transcript Region</MenuItem>
              <MenuItem value="genomic_region">Genomic Region</MenuItem>
              <MenuItem value="linker_sequence">Linker Sequence</MenuItem>
            </Select>
          </FormControl>
          <Delete />
          {componentType === 'transcript_region'
            ? (
              <TranscriptRegionCard
                componentValues={componentValues}
                handleCardChange={handleCardChange}
              />
            )
            : null}
          {componentType === 'genomic_region'
            ? (
              <GenomicRegionCard
                componentValues={componentValues}
                handleCardChange={handleCardChange}
              />
            )
            : null}
          {componentType === 'linker_sequence'
            ? (
              <LinkerSequenceCard
                componentValues={componentValues}
                handleCardChange={handleCardChange}
              />
            )
            : null}
        </Box>
      </Paper>
    </Box>
  );
};

export default SpecificComponentCard;
