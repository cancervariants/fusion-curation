import { React } from 'react';
import {
  FormControl, IconButton, MenuItem, Select, TableCell, TableRow,
  TextField, Tooltip,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    'margin-top': theme.spacing(1),
    'margin-bottom': theme.spacing(1),
    'margin-right': theme.spacing(1),
    'margin-left': 4,
    minWidth: 120,
  },
}));

const RegulatoryElement = ({
  key, elementValues, handleChange, handleDelete, cellClass,
}) => {
  const classes = useStyles();

  return (
    <TableRow key={key}>
      <TableCell className={cellClass}>
        <FormControl className={classes.formControl}>
          <Select
            labelId="type-select"
            id="type-select"
            value={elementValues.type}
            onChange={(event) => handleChange('type', event.target.value)}
          >
            <MenuItem value="promoter">Promoter</MenuItem>
            <MenuItem value="enhancer">Enhancer</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell className={cellClass}>
        <TextField
          id="standard-basic"
          value={elementValues.gene}
          onChange={(event) => handleChange('gene', event.target.value)}
        />
      </TableCell>
      <TableCell className={cellClass}>
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={handleDelete}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default RegulatoryElement;
