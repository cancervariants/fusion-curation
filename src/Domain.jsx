import { React } from 'react';
import {
  Box, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, TextField, Tooltip,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const Domain = ({ domainValues, handleChange, handleDelete }) => {
  const classes = useStyles();

  return (
    <Paper elevation={2}>
      <Box p={1}>
        <FormControl className={classes.formControl}>
          <InputLabel>Status</InputLabel>
          <Select
            labelId="status-select"
            id="status-select"
            value={domainValues.status}
            onChange={(event) => handleChange('status', event.target.value)}
          >
            <MenuItem value="lost">Lost</MenuItem>
            <MenuItem value="preserved">Preserved</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="standard-basic"
          label="Domain name"
          value={domainValues.name}
          onChange={(event) => handleChange('name', event.target.value)}
        />
        <TextField
          id="standard-basic"
          label="Gene"
          value={domainValues.gene}
          onChange={(event) => handleChange('gene', event.target.value)}
        />
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={handleDelete}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default Domain;
