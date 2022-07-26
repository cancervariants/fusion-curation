import './OtherAttribs.scss';
import { FusionContext } from '../../../global/contexts/FusionContext';
import React, { useContext, useState } from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
  index: number
}

// TODO merge theme with FormControl?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme) => ({
  formControl: {
    fontWeight: 300
  },
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const OtherAttribs: React.FC<Props> = ({ index }) => {

  const classes = useStyles();

  const { fusion, setFusion } = useContext(FusionContext);

  //TODO: do a useref here or something

  const assignRadioValue = (value: boolean) => {
    if (value) {
      return 'yes';
    } else {
      return 'no';
    }
  };

  const [rFramePreserved, setRFramePreserved] = useState(
    fusion.r_frame_preserved !== undefined ?
      assignRadioValue(fusion.r_frame_preserved) :
      'unspecified'
  );
  const [causativeEvent, setCausativeEvent] = useState(
    fusion.causative_event !== undefined ? fusion.causative_event : 'unspecified'
  );

  const handleRFrameChange = (event) => {
    const value = event.target.value;
    if (value === 'yes') {
      setRFramePreserved('yes');
      setFusion({...fusion, r_frame_preserved: 'true'});
    } else if (value === 'no') {
      setRFramePreserved('no');
      setFusion({...fusion, r_frame_preserved: 'false'});
    } else if (value === 'not applicable') {
      setRFramePreserved('not_applicable');
      setFusion({...fusion, r_frame_preserved: 'not_applicable'});
    } else {
      setRFramePreserved('unspecified');
      setFusion({...fusion, r_frame_preserved: 'undefined' });
    }
  };

  const handleCauseChange = (event) => {
    const value = event.target.value;
    if (value !== 'unspecified') {
      setCausativeEvent(value);
      setFusion({...fusion, causative_event: value });
    } else {
      setCausativeEvent('unspecified');
      setFusion({...fusion, causative_event: undefined });
    }
  };

  return (
    <div className='other-attribs-tab-container'>
      <FormControl component='fieldset'>
        <h3>Must the reading frame be preserved?</h3>
        <RadioGroup
          aria-label='Must the reading frame be preserved?'
          name='controlled-radio-buttons-group'
          value={rFramePreserved}
          onChange={handleRFrameChange}
          className={classes.formControl}
        >
          <FormControlLabel value='yes' control={<Radio />} label='Yes' />
          <FormControlLabel value='no' control={<Radio />} label='No' />
          <FormControlLabel value='unspecified' control={<Radio />} label='Unspecified' />
        </RadioGroup>
        <h3>What is the causative event?</h3>
        <RadioGroup
          aria-label='Causative event?'
          name='controlled-radio-buttons-group'
          value={causativeEvent}
          onChange={handleCauseChange}
          className={classes.formControl}
        >
          <FormControlLabel value='rearrangement' control={<Radio />} label='Rearrangement' />
          <FormControlLabel value='trans-splicing' control={<Radio />} label='Trans-splicing' />
          <FormControlLabel value='read-through' control={<Radio />} label='Read-through' />
          <FormControlLabel value='unspecified' control={<Radio />} label='Unspecified' />
        </RadioGroup>
      </FormControl>
    </div>
  );
};
