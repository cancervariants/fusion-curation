import { React } from 'react';
import {
  Box, Paper, FormControl, Select, MenuItem, IconButton, Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import TranscriptRegionComponent from './TranscriptRegionComponent';
import GenomicRegionComponent from './GenomicRegionComponent';
import LinkerSequenceComponent from './LinkerSequenceComponent';
import GeneComponent from './GeneComponent';

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

const SpecificComponent = ({
  componentType, componentValues, handleCardChange, deleteCard,
}) => {
  const classes = useStyles();

  const renderCard = () => {
    if (componentType === 'transcript_region') {
      return (
        <TranscriptRegionComponent
          componentValues={componentValues}
          handleCardChange={handleCardChange}
        />
      );
    }
    if (componentType === 'genomic_region') {
      return (
        <GenomicRegionComponent
          componentValues={componentValues}
          handleCardChange={handleCardChange}
        />
      );
    }
    if (componentType === 'linker_sequence') {
      return (
        <LinkerSequenceComponent
          componentValues={componentValues}
          handleCardChange={handleCardChange}
        />
      );
    }
    if (componentType === 'gene') {
      return (
        <GeneComponent
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
          <Tooltip title="Delete">
            <IconButton aria-label="delete" onClick={deleteCard}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
          {renderCard()}
        </Box>
      </Paper>
    </Box>
  );
};

export default SpecificComponent;
