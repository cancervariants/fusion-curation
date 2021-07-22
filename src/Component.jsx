import { React, useState } from 'react';
import {
  Box, Paper, FormControl, Select, MenuItem, IconButton, Tooltip, Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DragIndicator } from '@material-ui/icons';
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

const Component = ({
  componentType, componentValues, handleCardChange, deleteCard,
}) => {
  const classes = useStyles();

  const [showDragIcon, setShowDragIcon] = useState(false);

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
    if (componentType === 'unknown') {
      return (
        <></>
      );
    }
    return null;
  };

  const toggleDragIcon = () => setShowDragIcon(!showDragIcon);

  return (
    <Box p={1} onMouseEnter={toggleDragIcon} onMouseLeave={toggleDragIcon}>
      <Paper elevation={2}>
        <Box p={1}>
          <Grid container direction="row" alignItems="center">
            <Grid item>
              {showDragIcon ? <DragIndicator /> : <DragIndicator color="disabled" />}
            </Grid>
            <Grid item xs={3} container direction="column" justifyContent="space-around" alignItems="center">
              <Grid item>
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
                    <MenuItem value="unknown">Unknown</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={10}>
                <Tooltip title="Delete">
                  <IconButton aria-label="delete" onClick={deleteCard}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <Grid item xs>
              {renderCard()}
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Component;
