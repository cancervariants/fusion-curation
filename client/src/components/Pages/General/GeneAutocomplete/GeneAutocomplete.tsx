import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getGeneSuggestions } from '../../../../services/main';

export const GeneAutocomplete = (
  { selectedGene, setSelectedGene, geneError, setGeneError, style }
) => {
  const [geneOptions, setGeneOptions] = useState([]);

  const updateAutocomplete = (term: string) => {
    setGeneError('');
    getGeneSuggestions(term).then(responseJson => {
      const suggestions = [];
      responseJson.suggestions?.forEach(suggestion => {
        if (suggestion[0] === '') {
          suggestions.push(suggestion[2]);
        } else {
          suggestions.push(suggestion[0]);
        }
      });
      setGeneOptions(suggestions);
    });
  };

  return (
    <Autocomplete
      freeSolo
      options={geneOptions}
      getOptionLabel={(option) => option}
      onChange={(event, value) => setSelectedGene(value)}
      renderInput={(params) =>
        <TextField
          {...params}
          label="Gene Symbol"
          margin="dense"
          style={style}
          variant="standard"
          value={selectedGene}
          error={geneError !== ''}
          onChange={event => {
            if (event.target.value !== '' && event.target.value !== null) {
              updateAutocomplete(event.target.value);
            }
          }}
          helperText={geneError !== '' ? geneError : null}
        />
      }
    />
  );
};
