import {useContext, useState} from 'react';
import {InputLabel, MenuItem, FormControl, Select, Button} from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { v4 as uuid } from 'uuid';
import RegulatoryElement from '../../../../../../src/RegulatoryElement';


const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: '80%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const RegElementForm: React.FC = () => {

  const classes = useStyles();

  const {fusion, setFusion} = useContext(FusionContext);

  const [type, setType] = useState(null);
  const [gene, setGene] = useState(null);
  const [location, setLocation] = useState(null);

  // const [open, setOpen] = useState(false);

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };
  const handleGeneChange = (event) => {
    setGene(event.target.value);
  };
  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };


  const handleAdd = () => {
    //again, should make a d.ts file for this:
    let cloneArray = Array.from(fusion['regulatory_elements']);

    let newRegElement = {
      "type": type,
      "element_id": uuid(),
      "gene_descriptor": {
        "id": "",
        "type": "",
        "gene_id": "",
        "label": gene,
      }
    }

    cloneArray.push(newRegElement);

    setFusion({ ...fusion, ...{ "regulatory_elements" :  cloneArray}});

  }

  // const handleClose = () => {
  //   setOpen(false);
  // };

  // const handleOpen = () => {
  //   setOpen(true);
  // };

  return (
    <div className="form-container">
      <div className="formInput">
        <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={type}
          onChange={handleTypeChange} 
          // onClose={handleClose}
          // onOpen={handleOpen}
        >
          <MenuItem value="Enhancer">Enhancer</MenuItem>
          <MenuItem value="Promoter">Promoter</MenuItem>
        </Select>
      </FormControl>
        </div>
        <div className="formInput">
        <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Gene</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          // onClose={handleClose}
          // onOpen={handleOpen}
          id="demo-simple-select"
          value={gene}
          onChange={handleGeneChange}
        >
          {/* TODO: link this to a separate API request that gives domain genes back based on genes */}
          
          <MenuItem value="BCR">BCR</MenuItem>
          <MenuItem value="ABL1">ABL1</MenuItem>
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

export default RegElementForm;