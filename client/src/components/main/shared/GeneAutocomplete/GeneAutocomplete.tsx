import React, { useState, useEffect } from 'react';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getGeneId, getGeneSuggestions } from '../../../../services/main';

interface Props {
  selectedGene: string;
  setSelectedGene: CallableFunction;
  geneText: string;
  setGeneText: CallableFunction;
  style: Object;
}

export const GeneAutocomplete: React.FC<Props> = (
  {
    selectedGene, setSelectedGene, geneText, setGeneText, style,
  }
) => {
  const [geneOptions, setGeneOptions] = useState([]);

  useEffect(() => {
    if (selectedGene === '') {
      setGeneText('');
      setGeneOptions([]);
    } else {
      getGeneSuggestions(selectedGene).then(suggestResponseJson => {
        if (suggestResponseJson.warnings) {
          // max matches exceeded is currently the only possible warning
          if (suggestResponseJson.warnings[0].startsWith('Exceeds max matches')) {
            // try exact match
            getGeneId(selectedGene).then(geneResponseJson => {
              if (geneResponseJson.warnings) {
                setGeneText('Unrecognized term');
                setGeneOptions([]);
              } else {
                setGeneText('');
                setGeneOptions([]);
              }
            });
          }
        } else if (suggestResponseJson.suggestions.length === 0) {
          setGeneText('Unrecognized term');
          setGeneOptions([]);
        } else {
          setGeneText('');
          setGeneOptions(suggestResponseJson.suggestions.map(s => s[0] !== '' ? s[0] : s[2]));
        }
      });
    }
  }, [selectedGene]);

  return (
    <Autocomplete
      freeSolo
      options={geneOptions}
      getOptionLabel={(option) => option}
      onChange={(event, value) => {
        setSelectedGene(value);
        if (value === '') {
          setGeneOptions([]);
        }
      }}
      value={selectedGene}
      disableClearable
      renderInput={(params) =>
        <TextField
          {...params}
          label="Gene Symbol"
          margin="dense"
          style={style}
          variant="standard"
          value={selectedGene}
          error={geneText !== ''}
          onChange={event => setSelectedGene(event.target.value)}
          helperText={geneText ? geneText : null}
        />
      }
    />
  );
};
