import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Close from '../../Domains/Main/Close';

import './RegElement.scss'

interface Props {
  index: number
}

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: '80%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export const RegElement: React.FC<Props> = ( { index }) => {
  const classes = useStyles();
  const [type, setType] = useState(null);
  const [gene, setGene] = useState(null);
  const [location, setLocation] = useState(null);
  const handleChange = (event) => {
    setType(event.target.value);
  };

  return (
    <div className=".reg-element-tab-container">
      <div className="left">
        <div className="blurb-container">
          <div className="blurb">
          This transcript structure appears to be associated with a <span className="bold">BCR Promoter</span> Regulatory Element. 
          </div>
          <div className="sub-blurb">
          You can add or remove domains. 
          </div>
          <div className="regel">
            BCR Promoter
            <span className="close-button-reg">
            <Close />
            </span>
            </div>
        </div>

      </div>
      <div className="right">
      <div className="form-container">
      <div className="formInput">
        <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={type}
          onChange={handleChange}
        >
          <MenuItem value={10}>Enhancer</MenuItem>
          <MenuItem value={20}>Promoter</MenuItem>
        </Select>
      </FormControl>
        </div>
        <div className="formInput">
        <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Gene</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={type}
          onChange={handleChange}
        >
          <MenuItem value={10}>BCR</MenuItem>
          <MenuItem value={20}>ABL1</MenuItem>
        </Select>
      </FormControl>
        </div>
        <div className="formInput">
        <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Location</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={type}
          onChange={handleChange}
        >
          <MenuItem value={10}>1 kb 5'</MenuItem>
          <MenuItem value={20}>1 kb 5'</MenuItem>
        </Select>
      </FormControl> 
      </div>
      <div className="add-button">
            <Button variant="outlined" color="primary">
            Add
            </Button>
          </div>
      </div>
        



      </div>

    </div>
  )

}