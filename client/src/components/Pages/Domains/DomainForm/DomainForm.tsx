import {useContext, useState} from 'react';
import {InputLabel, MenuItem, FormControl, Select, Button} from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { v4 as uuid } from 'uuid';
import './DomainForm.scss'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: '80%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const DomainForm: React.FC = () => {

  const classes = useStyles();

  const {fusion, setFusion} = useContext(FusionContext);

  const [domain, setDomain] = useState(null);
  const [gene, setGene] = useState(null);
  const [status, setStatus] = useState(null);

  const handleDomainChange = (event) => {
    setDomain(event.target.value);
  };
  const handleGeneChange = (event) => {
    setGene(event.target.value);
  };
  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };


  const handleAdd = () => {
    let cloneArray = Array.from(fusion['protein_domains']);
    
    //again, should make a d.ts file for this:
    let newDomain = {
      "status": status,
      "name": domain,
      "id": "",
      "domain_id": uuid(),
      "gene_descriptor": {
        "id": "",
        "label": gene,
        "gene_id": ""
      }
    }

    cloneArray.push(newDomain);

    setFusion({ ...fusion, ...{ "protein_domains" :  cloneArray}});

  }

  return (
    <div className="form-container">
      <div className="formInput">
        <FormControl className={classes.formControl}>
          <InputLabel>Gene</InputLabel>
          <Select value={gene} onChange={handleGeneChange}>
            {/* TODO: link this to a separate API request that gives domain genes back based on user input genes */}
            <MenuItem value="NTRK1">NTRK1</MenuItem>
            <MenuItem value="BCR">BCR</MenuItem>
            <MenuItem value="ABL1">ABL1</MenuItem>
          </Select>
        </FormControl>
        </div>
        <div className="formInput">
        <FormControl className={classes.formControl}>
          <InputLabel>Domain</InputLabel>
          <Select value={domain} onChange={handleDomainChange}>
            <MenuItem value="NTRK1">NTRK1</MenuItem>
            <MenuItem value="BCR">BCR</MenuItem>
            <MenuItem value="ABL1">ABL1</MenuItem>
          </Select>
        </FormControl>
        </div>
        <div className="formInput">
        <FormControl className={classes.formControl}>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={handleStatusChange}>
            <MenuItem value="Lost">Lost</MenuItem>
            <MenuItem value="Preserved">Preserved</MenuItem>
          </Select>
        </FormControl>
        </div>
        
      <div className="add-button">
            <Button variant="outlined" color="primary" onClick={() => handleAdd()}>
            Add
            </Button>
          </div>
      </div>
  )
}

export default DomainForm;