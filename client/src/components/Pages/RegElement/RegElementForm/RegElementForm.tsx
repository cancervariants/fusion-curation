import { useContext, useState, useEffect } from 'react';
import { InputLabel, MenuItem, FormControl, Select, Button, TextField } from '@material-ui/core/';
import { Autocomplete } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { v4 as uuid } from 'uuid';
import './RegElementForm.scss';

import { getGeneId } from '../../../../services/main';

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

  // TODO: this shouldnt be necessary
  useEffect(() => {
    if (regElements === undefined) {
      setFusion({ ...fusion, ...{ 'regulatory_elements': [] } });
    }
  }, []);

  const classes = useStyles();

  const { fusion, setFusion } = useContext(FusionContext);

  const regElements = fusion.regulatory_elements;

  const [type, setType] = useState(null);
  const [gene, setGene] = useState(null);
  const [geneWarning, setGeneWarning] = useState('');

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };
  const handleGeneChange = (event) => {
    setGeneWarning('');
    setGene(event.target.value);
  };

  const handleAdd = () => {
    getGeneId(gene)
      .then(geneResponse => {
        if (geneResponse.concept_id === null) {
          setGeneWarning('Gene ID not found!');
          throw new Error(geneWarning);
        }

        // eslint-disable-next-line prefer-const
        let cloneArray = Array.from(regElements);

        // eslint-disable-next-line prefer-const
        let newRegElement = {
          'type': type,
          'element_id': uuid(),
          'gene_descriptor': {
            'id': `gene:${geneResponse.term}`,
            'type': 'GeneDescriptor',
            'gene_id': geneResponse.concept_id,
            'label': geneResponse.term,
          }
        };

        cloneArray.push(newRegElement);

        setFusion({ ...fusion, ...{ 'regulatory_elements': cloneArray } });
        setGene('');
        setType(null);
      })
      .catch((error) => {
        console.error(error);
      }
      );
  };

  return (
    <div className='form-container'>
      <div className='formInput'>
        <FormControl className={classes.formControl}>
          <InputLabel id='demo-simple-select-label'>Type</InputLabel>
          <Select
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={type}
            onChange={handleTypeChange}
          >
            <MenuItem value='Enhancer'>Enhancer</MenuItem>
            <MenuItem value='Promoter'>Promoter</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className='formInput'>
        {/* <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Gene</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={gene}
          onChange={handleGeneChange}
        >


          <MenuItem value="BCR">BCR</MenuItem>
          <MenuItem value="ABL1">ABL1</MenuItem>
        </Select>
      </FormControl> */}

        <TextField
          className={classes.formControl}
          id='standard-basic'
          label='Gene Symbol'
          variant='standard'
          value={gene}
          error={geneWarning !== ''}
          onChange={handleGeneChange}
          helperText={geneWarning !== '' ? geneWarning : null}
        />
      </div>

      <div className='regel-add-button '>
        <Button variant='outlined' color='primary' onClick={() => handleAdd()}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default RegElementForm;