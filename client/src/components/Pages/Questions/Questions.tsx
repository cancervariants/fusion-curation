import './Questions.scss'
import { FusionContext } from '../../../global/contexts/FusionContext';
import React, { useContext, useState, useEffect } from 'react';
import {FormLabel, FormControl, FormControlLabel, Radio, RadioGroup} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
  index: number
}

const useStyles = makeStyles((theme) => ({
  formControl: {
    fontWeight: 300
  },
}));

export const Questions: React.FC<Props> = ( { index }) => {

  const {fusion, setFusion} = useContext(FusionContext)

  //TODO: do a useref here or something
  
  let preserved;
  if(fusion.r_frame_preserved !== undefined){
    preserved = fusion.r_frame_preserved ? 'Yes' : 'No';
  } else {
    preserved = null;
  }
  const [rFramePreserved, setRFramePreserved] = useState(preserved);
  const [causativeEvent, setCausativeEvent] = useState(fusion.causative_event);

  const classes = useStyles();

  const handleRFrameChange = (event) => {
    let preserved = (event.target.value === 'Yes')
    setRFramePreserved(event.target.value);
    setFusion({...fusion, ...{"r_frame_preserved": preserved}})
  };

  const handleCauseChange = (event) => {
    setCausativeEvent(event.target.value);
    setFusion({...fusion, ...{"causative_event": event.target.value}})
  };

  return (
    <div className="questions-tab-container">
    <FormControl component="fieldset">
      <h3>Is the reading frame predicted to be preserved?</h3>
      <RadioGroup
        aria-label="Is the reading frame predicted to be preserved?"
        name="controlled-radio-buttons-group"
        value={rFramePreserved}
        onChange={handleRFrameChange}
        className={classes.formControl} 
      >
        <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
        <FormControlLabel value="No" control={<Radio />} label="No" />
      </RadioGroup>
      <h3>What is the causative event?</h3>
      <RadioGroup
        aria-label="Causative event?"
        name="controlled-radio-buttons-group"
        value={causativeEvent}
        onChange={handleCauseChange}
        className={classes.formControl} 
      >
        <FormControlLabel value="Rearrangement" control={<Radio />} label="Rearrangement" />
        <FormControlLabel value="Read-through" control={<Radio />} label="Read-through" />
        <FormControlLabel value="Trans-splicing" control={<Radio />} label="Trans-splicing" />
        <FormControlLabel value="Unknown" control={<Radio />} label="Unknown" />
      </RadioGroup>
    </FormControl>
    </div>
  );

}