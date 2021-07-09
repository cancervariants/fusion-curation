import { React } from 'react';
import { Box, FormLabel, TextField } from '@material-ui/core';

const FunctionalDomainsForm = ({ setRetainedDomains, setRetainedDomainGenes }) => {
  function domainHandleChange(event) {
    setRetainedDomains(event.target.value);
  }

  function geneHandleChange(event) {
    setRetainedDomainGenes(event.target.value);
  }

  return (
    <>
      <Box p={1}>
        <FormLabel component="legend">Record predicted meaningful protein functional domains preserved:</FormLabel>
        <form noValidate autoComplete="off" onChange={domainHandleChange}>
          <TextField multiline />
        </form>
      </Box>
      <Box p={1}>
        <FormLabel component="legend">Record associated genes:</FormLabel>
        <form noValidate autoComplete="off" onChange={geneHandleChange}>
          <TextField />
        </form>
      </Box>
      <p />
    </>
  );
};

export default FunctionalDomainsForm;
