import { React } from 'react';
import {
  Box, Paper, FormControl, Select, MenuItem, IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import TranscriptRegionCard from './TranscriptRegionCard';
import GenomicRegionCard from './GenomicRegionCard';
import LinkerSequenceCard from './LinkerSequenceCard';
import GeneCard from './GeneCard';

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

const SpecificComponentCard = ({
  componentType, componentValues, handleCardChange, deleteCard,
}) => {
  const classes = useStyles();

  const renderCard = () => {
    if (componentType === 'transcript_region') {
      return (
        <TranscriptRegionCard
          componentValues={componentValues}
          handleCardChange={handleCardChange}
        />
      );
    }
    if (componentType === 'genomic_region') {
      return (
        <GenomicRegionCard
          componentValues={componentValues}
          handleCardChange={handleCardChange}
        />
      );
    }
    if (componentType === 'linker_sequence') {
      return (
        <LinkerSequenceCard
          componentValues={componentValues}
          handleCardChange={handleCardChange}
        />
      );
    }
    if (componentType === 'gene') {
      return (
        <GeneCard
          componentValues={componentValues}
          handleCardChange={handleCardChange}
        />
      );
    }
    return null;
  };

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
              <MenuItem value="gene">Gene</MenuItem>
            </Select>
          </FormControl>
          <IconButton aria-label="delete" onClick={deleteCard}>
            <CloseIcon />
          </IconButton>
          {renderCard()}
        </Box>
      </Paper>
    </Box>
  );
};

export default SpecificComponentCard;
