import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getGeneId, getGeneSuggestions } from '../../../../services/main';

interface Props {
  selectedGene: string,
  setSelectedGene: CallableFunction,
  geneText: string,
  setGeneText: CallableFunction,
  geneError: boolean,
  setGeneError: CallableFunction,
  style: Object
}

export const GeneAutocomplete: React.FC<Props> = (
  { selectedGene, setSelectedGene, geneText, setGeneText, geneError, setGeneError, style }
) => {
  const [geneOptions, setGeneOptions] = useState([]);

  const updateAutocomplete = (term: string) => {
    getGeneSuggestions(term).then(responseJson => {
      if (responseJson.warnings || (responseJson.suggestions.length === 0)) {
        getGeneId(term).then(geneResponseJson => {
          if (geneResponseJson.warnings) {
            setGeneError(true);
            setGeneText('Unrecognized term');
          } else {
            setGeneError(false);
            setGeneText('');
          }
        });
      } else {
        const suggestions = [];
        responseJson.suggestions?.forEach(suggestion => {
          if (suggestion[0] === '') {
            suggestions.push(suggestion[2]);
          } else {
            suggestions.push(suggestion[0]);
          }
        });
        setGeneOptions(suggestions);

        const termLower = term.toLowerCase();
        const index = suggestions.findIndex((element: string) => {
          return element.toLowerCase() === termLower;
        });
        if (index === -1) {
          setGeneError(true);
          setGeneText('Unrecognized term');
        } else {
          setGeneError(false);
          setGeneText('');
        }
      }
    });
  };

  return (
    <Autocomplete
      freeSolo
      options={geneOptions}
      getOptionLabel={(option) => option}
      onChange={(event, value) => setSelectedGene(value)}
      value={selectedGene}
      renderInput={(params) =>
        <TextField
          {...params}
          label="Gene Symbol"
          margin="dense"
          style={style}
          variant="standard"
          value={selectedGene}
          error={geneError}
          onChange={event => {
            if (event.target.value !== '' && event.target.value !== null) {
              updateAutocomplete(event.target.value);
              setSelectedGene(event.target.value);
            } else if (event.target.value === '') {
              setGeneText('');
            }
          }}
          helperText={geneText !== '' ? geneText : null}
        />
      }
    />
  );
};
