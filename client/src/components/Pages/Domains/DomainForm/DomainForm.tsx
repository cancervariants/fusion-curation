import { useContext, useState, useEffect } from 'react';
import { InputLabel, MenuItem, FormControl, Select, Button } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { DomainOptionsContext } from '../../../../global/contexts/DomainOptionsContext';
import { v4 as uuid } from 'uuid';
import './DomainForm.scss';
import { CriticalDomain, DomainStatus } from '../../../../services/ResponseModels';

interface ClientCriticalDomain extends CriticalDomain {
  domain_id: string,
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

  // values for visible item
  const [gene, setGene] = useState('');
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('');

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
    if (!(status === 'Lost' || status === 'Preserved')) {
      console.error('error');
      return;
    }
    const newDomain: ClientCriticalDomain = {
      status: status.toLowerCase() as DomainStatus,
      name: domainOptions[gene].find(e => e[0] === domain)[1],
      id: domain,
      domain_id: uuid(),
      gene_descriptor: {
        id: '',  // TODO get more gene info
        type: 'GeneDescriptor',
        label: '',
        gene_id: gene
      }
    };

    const cloneArray = Array.from(fusion['protein_domains']);
    cloneArray.push(newDomain);
    setFusion({ ...fusion, ...{ 'protein_domains': cloneArray } });

    setGene('');
    setDomain('');
    setStatus('');
  };

  const renderGeneOptions = () => {
    // concatenate default/unselectable option with all selectable genes
    return [
      (<MenuItem key={-1} value="" disabled></MenuItem>)
    ].concat(Object.keys(domainOptions).map((gene_name: string, index: number) => (
      <MenuItem
        key={index}
        value={gene_name}
      >
        {gene_name}
      </MenuItem>
    )));
  };

  const renderDomainOptions = () => {
    const domainOptionMenuItems = [(
      <MenuItem key={-1} value="" disabled></MenuItem>
    )];
    if (domainOptions[gene]) {
      return domainOptionMenuItems.concat(
        domainOptions[gene].map((domain: Array<string>, index: number) => (
          <MenuItem key={index} value={domain[0]}>
            {domain[1]}
          </MenuItem>
        ))
      );
    }
    return domainOptionMenuItems;
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
            disabled={Object.keys(domainOptions).length === 0}
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
            disabled={gene === ''}
          >
            {renderDomainOptions()}
          </Select>
        </FormControl>
      </div>
      <div className='formInput'>
        <FormControl className={classes.formControl}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={handleStatusChange}
            disabled={domain === ''}
          >
            <MenuItem value='default' disabled></MenuItem>
            <MenuItem value='Lost'>Lost</MenuItem>
            <MenuItem value='Preserved'>Preserved</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className='add-button'>
        <Button
          variant='outlined'
          color='primary'
          onClick={handleAdd}
          disabled={status === ''}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default DomainForm;