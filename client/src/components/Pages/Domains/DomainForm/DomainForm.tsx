import React, { useContext, useState, useEffect } from 'react';
import { InputLabel, MenuItem, FormControl, Select, Button } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { DomainOptionsContext } from '../../../../global/contexts/DomainOptionsContext';
import { v4 as uuid } from 'uuid';
import './DomainForm.scss';
import { CriticalDomain } from '../../../../services/ResponseModels';

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
  // // TODO: shouldn't be necessary
  useEffect(() => {
    if (fusion.protein_domains === undefined) {
      setFusion({ ...fusion, ...{ 'protein_domains': [] } });
    }
  }, []);

  const classes = useStyles();

  const { domainOptions } = useContext(DomainOptionsContext);

  const { fusion, setFusion } = useContext(FusionContext);
  const domains = fusion.protein_domains || [];

  // values for visible item
  const [gene, setGene] = useState(null);
  const [domain, setDomain] = useState(null);
  const [status, setStatus] = useState(null);

  const handleGeneChange = (event) => {
    setGene(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleDomainChange = (event) => {
    setDomain(event.target.value);
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

    newDomain.status = status;
    newDomain.name = domainOptions[gene].find(e => e[0] === domain)[1];
    newDomain.id = domain;
    newDomain.gene_descriptor.id = '';
    newDomain.gene_descriptor.label = '';
    newDomain.gene_descriptor.gene_id = gene;

    const cloneArray = Array.from(fusion['protein_domains']);
    cloneArray.push(newDomain);
    setFusion({ ...fusion, ...{ 'protein_domains': cloneArray } });
  };

  const renderGeneOptions = () => {
    return Object.keys(domainOptions).map((gene_name: string, index: number) => (
      <MenuItem
        key={index}
        value={gene_name}
      >
        {gene_name}
      </MenuItem>
    ));
  };

  const renderDomainOptions = () => {
    if (domainOptions[gene]) {
      return domainOptions[gene].map((domain: Array<string>, index: number) => (
        <MenuItem
          key={index}
          value={domain[0]}
        >
          {domain[1]}
        </MenuItem>
      ));
    }
    else {
      return <div></div>;
    }
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
            {renderGeneOptions()}
          </Select>
        </FormControl>
      </div>

      <div className='formInput'>
        <FormControl className={classes.formControl}>
          <InputLabel>Domain</InputLabel>
          <Select
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={domain}
            onChange={handleDomainChange}
          >
            {renderDomainOptions()}
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