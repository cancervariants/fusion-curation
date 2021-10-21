import React, { useContext, useState, useEffect } from 'react';
import { InputLabel, MenuItem, FormControl, Select, Button } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { v4 as uuid } from 'uuid';
import './DomainForm.scss';

import { getDomainId } from '../../../../services/main';
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

const DomainForm: React.FC = () => {
  // TODO: shouldn't be necessary
  useEffect(() => {
    if (domains === undefined) {
      setFusion({ ...fusion, ...{ 'protein_domains': [] } });
    }
  }, []);

  const classes = useStyles();

  const { fusion, setFusion } = useContext(FusionContext);
  const domains = fusion.protein_domains;
  const [domainList, setDomainList] = useState([]);

  const geneOptions = fusion.transcript_components.filter((component) => {
    if (['gene'].includes(component.component_type)) {
      return true;
    } else {
      return false;
    }
  }).map((component) => {
    // start with just genes
    return component.gene_descriptor.label;
  });

  // values for visible item
  const [gene, setGene] = useState(null);
  const [domain, setDomain] = useState(null);
  const [status, setStatus] = useState(null);

  const [geneWarning, setGeneWarning] = useState('');

  const handleGeneChange = (event) => {
    setGene(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleAdd = () => {
    //TODO: pull from model file
    const newDomain = {
      'status': '',
      'name': '',
      'id': '',
      'domain_id': uuid(),
      'gene_descriptor': {
        'id': '',
        'label': '',
        'gene_id': ''
      }
    };

    // TODO: should be able to remove
    // just update structure object and be done
    getDomainId(domain)
      .then(domainResponse => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { domain, domain_id, warnings } = domainResponse;

        // if (domainResponse.statusCode > 400) {
        //   setDomainWarning(warnings);
        //   throw new Error(warnings);
        // }

        newDomain.status = status;
        newDomain.name = domain;
        newDomain.id = domain_id;

        return newDomain;
      }
      )
      .then((newDomain) => {
        getGeneId(gene).then(geneResponse => {
          // eslint-disable-next-line prefer-const
          let { term, concept_id, warnings } = geneResponse;
          if (concept_id === null) {
            setGeneWarning(warnings);
            throw new Error(warnings);
          }

          newDomain.gene_descriptor.label = term;
          newDomain.gene_descriptor.id = `gene:${term}`;
          newDomain.gene_descriptor.gene_id = concept_id;

          // eslint-disable-next-line prefer-const
          let cloneArray = Array.from(fusion['protein_domains']);
          cloneArray.push(newDomain);
          setFusion({ ...fusion, ...{ 'protein_domains': cloneArray } });
        }
        )
          .catch(error => {
            console.error(`Error!!!! ${error}`);
          });
      })
      .catch(error => {
        console.error(`Error!!!! ${error}`);
      });
  };

  const renderGeneOption = () => {
    return geneOptions.map((gene: string, index: number) => (
      <MenuItem
        key={index}
        value={gene}
      >
        {gene}
      </MenuItem>
    ));
  };

  return (
    <div className='form-container'>
      <div className='formInput'>
        <FormControl className={classes.formControl}>
          <InputLabel id='demo-simple-select-label'>Gene</InputLabel>
          <Select
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={gene}
            onChange={handleGeneChange}
          >
            {renderGeneOption()}
          </Select>
        </FormControl>
      </div>
      <div className='formInput'>
        <FormControl className={classes.formControl}>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={handleStatusChange}>
            <MenuItem value='Lost'>Lost</MenuItem>
            <MenuItem value='Preserved'>Preserved</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className='add-button'>
        <Button variant='outlined' color='primary' onClick={() => handleAdd()}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default DomainForm;