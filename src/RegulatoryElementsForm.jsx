import { React } from 'react';
import {
  Box, FormLabel, Paper, Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddButton from './AddButton';
import RegulatoryElement from './RegulatoryElement';

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

const RegulatoryElementsForm = ({ items, setItems }) => {
  const classes = useStyles();

  const handleAdd = () => {
    const newItem = {};
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const handleDelete = (index) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  const handleChange = (index, field, newValue) => {
    const copy = [...items];
    copy[index][field] = newValue;
    setItems(copy);
  };

  const renderItem = (item, i) => (
    <RegulatoryElement
      key={i}
      index={i}
      elementValues={item}
      handleChange={(field, newValue) => handleChange(i, field, newValue)}
      handleDelete={() => handleDelete(i)}
      cellClass={classes.tableCell}
    />
  );

  return (
    <>
      <Box p={1}>
        <FormLabel components="legend">
          Record regulatory element type(s) and associated genes:
        </FormLabel>
      </Box>
      <Box p={1}>
        <TableContainer component={Paper}>
          <Table aria-label="regulatory elements">
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableCell}>Type</TableCell>
                <TableCell className={classes.tableCell}>Gene</TableCell>
                <TableCell className={classes.tableCell}>Delete?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, i) => renderItem(item, i))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box p={1}>
        <AddButton label="Regulatory Element" clickHandler={handleAdd} />
      </Box>
    </>
  );
};

export default RegulatoryElementsForm;
