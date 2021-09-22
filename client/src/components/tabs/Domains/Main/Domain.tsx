import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import Close from './Close'

import './Domain.scss'

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

export const Domain: React.FC<Props> = ( { index }) => {
  const classes = useStyles();
  const [type, setType] = useState(null);
  const [gene, setGene] = useState(10);
  const [domain, setDomain] = useState('');
  const handleChange = (event) => {
    setType(event.target.value);
  };

  return (
    <div className="domain-tab-container">
      <div className="left">
        <div className="blurb-container">
          <div className="blurb">
          We found <span className="bold">1</span>  protein functional domain that appears to be affected.
          </div>
          <div className="sub-blurb">
          You can add or remove domains. 
          </div>
          <div className="domain">
            MYC Kinase Domain [Preserved]
            <span className="close-button">
            <Close />
            </span>
            
          </div>
        </div>

      </div>
      <div className="right">
        <div className="form-container">
          <div className="formInput">
            <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">Gene</InputLabel>
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
            <InputLabel id="demo-simple-select-label">Domain</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={type}
              onChange={handleChange}
            >

            </Select>
          </FormControl>
            </div>
          <div className="formInput">
            <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">Status</InputLabel>
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