import {useContext, useState, useEffect} from 'react';
import {InputLabel, MenuItem, FormControl, Select, Button, TextField} from '@material-ui/core/';
import {Autocomplete} from '@material-ui/lab/';
import { makeStyles } from '@material-ui/core/styles';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { v4 as uuid } from 'uuid';
import './DomainForm.scss'

import { getDomainId } from '../../../../services/main';
import { getGeneId } from '../../../../services/main';
import { getDomainList } from '../../../../services/main';

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
  // TODO: shouldn't be necessary
  useEffect(() => {
    if (domains === undefined){
      setFusion({ ...fusion, ...{ "protein_domains" :  []}});
    }
  }, [])

  const classes = useStyles();

  const {fusion, setFusion} = useContext(FusionContext);
  const domains = fusion.protein_domains;

  const [domainList, setDomainList] = useState([]);

  const [domain, setDomain] = useState(null);
  const [gene, setGene] = useState(null);
  const [status, setStatus] = useState(null);

  const [geneWarning, setGeneWarning] = useState('');
  const [domainWarning, setDomainWarning] = useState('');

  const handleDomainInput = (value) => {

    setDomainWarning('');

    getDomainList(value).then(data => {
      let suggestions = [];
      data.suggestions?.forEach(suggestion => {
        suggestions.push(suggestion[0]);
      })
      setDomainList(suggestions);
      
    })
  };

  const handleGeneChange = (event) => {
    setGeneWarning('');
    setGene(event.target.value.toUpperCase());
  };
  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };


  const handleAdd = () => {
    //TODO: pull from model file
    let newDomain = {
      "status": "",
      "name": "",
      "id": "",
      "domain_id": uuid(),
      "gene_descriptor": {
        "id": "",
        "label": "",
        "gene_id": ""
      }
    }

    getDomainId(domain)
      .then(domainResponse => {
        let {domain, domain_id, warnings} = domainResponse;

        if (domainResponse.statusCode > 400){
          setDomainWarning(warnings);
          throw new Error(warnings);
        }
        
        newDomain.status = status;
        newDomain.name = domain;
        newDomain.id = domain_id;

        return newDomain;
      }
    )
    .then((newDomain) => {
      getGeneId(gene).then(geneResponse => {
        let {term, concept_id, warnings} = geneResponse;
        if (concept_id === null){
          setGeneWarning(warnings);
          throw new Error(warnings);
        }

        newDomain.gene_descriptor.label = term;
        newDomain.gene_descriptor.id = `gene:${term}`;
        newDomain.gene_descriptor.gene_id = concept_id;

        let cloneArray = Array.from(fusion['protein_domains']);
        cloneArray.push(newDomain);
        setFusion({ ...fusion, ...{ "protein_domains" :  cloneArray}});
      }
    )
    .catch(error => {
      console.error(`Error!!!! ${error}`)
    })
    })
    .catch(error => {
      console.error(`Error!!!! ${error}`)
    })
  }

  return (
    <div className="form-container">
        <div className="formInput">
        <Autocomplete
          className={classes.formControl}
          id="combo-box-demo"
          options={domainList}
          getOptionLabel={(option) => option}
          style={{ width: 300 }}
          onChange={(event, value) => setDomain(value)}
          renderInput={(params) => 
            <TextField {...params}
            id="standard-basic" 
            label="Domain" 
            variant="standard" 
            value={domain}
            error={domainWarning !== ''}
            onChange={event => {
              if (event.target.value !== "" && event.target.value !== null){
                handleDomainInput(event.target.value)
              }
            }}
            helperText={domainWarning !== '' ? domainWarning : null}
          />
          }
        /> 
        </div>
        <div className="formInput"> 
        <TextField 
          className={classes.formControl} 
          id="standard-basic" 
          label="Gene" 
          variant="standard" 
          value={gene}
          error={geneWarning !== ''}
          onChange={handleGeneChange}
          helperText={geneWarning !== '' ? geneWarning : null}
        />
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