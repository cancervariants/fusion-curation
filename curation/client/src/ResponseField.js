import { React } from 'react';
import { Box, TextField } from '@material-ui/core';

const ResponseField = ({ jsonValue, readableValue }) => (
  <>
    <Box p={1}>
      <TextField
        id="response-json"
        label="JSON"
        multiline
        variant="outlined"
        InputProps={{
          readOnly: true,
        }}
        value={jsonValue}
        style={{ width: 700 }}
      />
    </Box>
    <Box p={1}>
      <TextField
        id="response-hgvs"
        label="HGVS-like"
        multiline
        variant="outlined"
        InputProps={{
          readOnly: true,
        }}
        value={readableValue}
        style={{ width: 700 }}
      />
    </Box>
  </>
);

export default ResponseField;
