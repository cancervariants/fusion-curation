import { React } from 'react';
import {
  Box, FormLabel, Paper, Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Domain from './Domain';
import AddDomainButton from './AddDomainButton';

const useStyles = makeStyles({
  tableCell: {
    'padding-left': 8,
    'padding-top': 2,
    'padding-right': 8,
    'padding-bottom': 2,
  },
  formControl: {
    'margin-left': 0,
  },
});

const DomainsForm = ({ domains, setDomains }) => {
  const classes = useStyles();

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
      cellClass={classes.tableCell}
    />
  );

  return (
    <>
      <Box p={1}>
        <FormLabel components="legend">
          Record predicted meaningful protein functional domains affected:
        </FormLabel>
      </Box>
      <Box p={1}>
        <TableContainer component={Paper}>
          <Table aria-label="affected functional domains">
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableCell}>Status</TableCell>
                <TableCell className={classes.tableCell}>Domain Name</TableCell>
                <TableCell className={classes.tableCell}>Gene</TableCell>
                <TableCell className={classes.tableCell}>Delete?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {domains.map((domain, i) => renderDomain(domain, i))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box p={1}>
        <AddDomainButton clickHandler={handleAdd} />
      </Box>
    </>
  );
};

export default DomainsForm;
