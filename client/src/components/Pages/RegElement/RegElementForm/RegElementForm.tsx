import { Button, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { useContext, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { getGeneId } from '../../../../services/main';
import { ClientRegulatoryElement } from '../../../../services/ResponseModels';
import { GeneAutocomplete } from '../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import './RegElementForm.scss';

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
  const [geneError, setGeneError] = useState('');

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleAdd = () => {
    getGeneId(gene)
      .then(geneResponse => {
        if (geneResponse.concept_id === null) {
          setGeneError('Gene ID not found!');
          throw new Error(geneError);
        }

        const cloneArray = Array.from(regElements);

        const newRegElement: ClientRegulatoryElement = {
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
            <MenuItem value='enhancer'>Enhancer</MenuItem>
            <MenuItem value='promoter'>Promoter</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className='formInput'>
        <GeneAutocomplete
          selectedGene={gene}
          setSelectedGene={setGene}
          geneError={geneError}
          setGeneError={setGeneError}
          style={{ width: 440 }}
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