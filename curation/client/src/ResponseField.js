import { React, useState } from 'react';
import { Box, TextField } from '@material-ui/core';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ResponseField = ({ jsonValue, readableValue }) => {
  const [objectFieldLabel, setObjectFieldLabel] = useState('JSON');
  const [readableFieldLabel, setReadableFieldLabel] = useState('HGVS-like');

  async function handleObjectFieldClick(click) {
    navigator.clipboard.writeText(jsonValue);
    setObjectFieldLabel('copied!');
    click.target.select();
    await sleep(70);
    // eslint-disable-next-line no-param-reassign
    click.target.selectionStart = 0;
    // eslint-disable-next-line no-param-reassign
    click.target.selectionEnd = 0;
    await sleep(2000);
    setObjectFieldLabel('JSON');
  }

  async function handleReadableFieldClick(click) {
    navigator.clipboard.writeText(readableValue);
    setReadableFieldLabel('copied!');
    click.target.select();
    await sleep(70);
    // eslint-disable-next-line no-param-reassign
    click.target.selectionStart = 0;
    // eslint-disable-next-line no-param-reassign
    click.target.selectionEnd = 0;
    await sleep(2000);
    setReadableFieldLabel('HGVS-like');
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
          onClick={(click) => handleObjectFieldClick(click)}
          style={{ width: 700 }}
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
          onClick={(click) => handleReadableFieldClick(click)}
          style={{ width: 700 }}
        />
      </Box>
    </>
  );
};

export default ResponseField;
