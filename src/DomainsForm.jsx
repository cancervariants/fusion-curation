import { React } from 'react';
import { Box, FormLabel } from '@material-ui/core';
import Domain from './Domain';
import AddDomainButton from './AddDomainButton';

const DomainsForm = ({ domains, setDomains }) => {
  const handleAdd = () => {
    const newDomain = {};
    setDomains((prevDomains) => [...prevDomains, newDomain]);
  };

  const handleDelete = (index) => {
    const copy = [...domains];
    copy.splice(index, 1);
    setDomains(copy);
  };

  const handleChange = (index, field, newValue) => {
    const domainsCopy = [...domains];
    domainsCopy[index][field] = newValue;
    setDomains(domainsCopy);
  };

  const renderDomain = (domain, i) => (
    <Domain
      key={i}
      index={i}
      domainValues={domain}
      handleChange={(field, newValue) => handleChange(i, field, newValue)}
      handleDelete={() => handleDelete(i)}
    />
  );

  return (
    <>
      <Box p={1}>
        <FormLabel components="legend">
          Record predicted meaningful protein functional domains affected:
        </FormLabel>
        <>
          {domains.map((domain, i) => renderDomain(domain, i))}
        </>
      </Box>
      <Box p={1}>
        <AddDomainButton clickHandler={handleAdd} />
      </Box>
    </>
  );
};

export default DomainsForm;
