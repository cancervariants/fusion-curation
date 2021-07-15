import { React, useState } from 'react';
import { Box, TextField } from '@material-ui/core';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ResponseField = ({ jsonValue, readableValue }) => {
  const [objectFieldLabel, setObjectFieldLabel] = useState('JSON');
  const [readableFieldLabel, setReadableFieldLabel] = useState('HGVS-like');

  async function handleObjectFieldClick() {
    if (jsonValue && jsonValue !== '') {
      navigator.clipboard.writeText(jsonValue);
      setObjectFieldLabel('copied!');
      await sleep(2000);
      setObjectFieldLabel('JSON');
    }
  }

  async function handleReadableFieldClick() {
    if (readableValue && readableValue !== '') {
      navigator.clipboard.writeText(readableValue);
      setReadableFieldLabel('copied!');
      await sleep(2000);
      setReadableFieldLabel('HGVS-like');
    }
  }

  return (
    <>
      <Box p={1}>
        <TextField
          id="response-json"
          label={objectFieldLabel}
          multiline
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
          value={jsonValue}
          onClick={() => handleObjectFieldClick()}
          style={{ width: 700 }}
          rowsMax={14}
        />
      </Box>
      <Box p={1}>
        <TextField
          id="response-hgvs"
          label={readableFieldLabel}
          multiline
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
          value={readableValue}
          onClick={() => handleReadableFieldClick()}
          style={{ width: 700 }}
        />
      </Box>
    </>
  );
};

export default ResponseField;
