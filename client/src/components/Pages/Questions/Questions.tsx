import './Questions.scss'
import { FusionContext } from '../../../global/contexts/FusionContext';
import React, { useContext, useState, useEffect } from 'react';
import {FormLabel, FormControl, FormControlLabel, Radio, RadioGroup} from '@material-ui/core';

interface Props {
  index: number
}

export const Questions: React.FC<Props> = ( { index }) => {
  const [rFramePreserved, setRFramePreserved] = React.useState(null);
  const [causativeEvent, setCausativeEvent] = React.useState(null);

  const {fusion, setFusion} = useContext(FusionContext)

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
      >
        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
        <FormControlLabel value="no" control={<Radio />} label="No" />
      </RadioGroup>
      <h3>What is the causative event?</h3>
      <RadioGroup
        aria-label="Causative event?"
        name="controlled-radio-buttons-group"
        value={causativeEvent}
        onChange={handleCauseChange}
      >
        <FormControlLabel value="rearrangement" control={<Radio />} label="Rearrangement" />
        <FormControlLabel value="readthrough" control={<Radio />} label="Read-through" />
        <FormControlLabel value="transsplicing" control={<Radio />} label="Trans-splicing" />
        <FormControlLabel value="unknown" control={<Radio />} label="Unknown" />
      </RadioGroup>
    </FormControl>
    </div>
  );

  // return (
  //   <div className="questions-tab-container">
  //     <div>
  //       Is the reading frame predicted to be preserved?
  //     </div>
  //     <div>
  //       Is the causative event known? (rearrangement, read-through, trans-splicing, unknown)
  //     </div>

      
  //   </div>
  // )
}
