import React, { useState, KeyboardEvent, useEffect } from 'react';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getGeneId, getGeneSuggestions } from '../../../../services/main';

interface Props {
  selectedGene: string;
  setSelectedGene: CallableFunction;
  geneText: string;
  setGeneText: CallableFunction;
  onKeyDown?: (e: KeyboardEvent) => void;
  style: Object;
}

export const GeneAutocomplete: React.FC<Props> = (
  {
    selectedGene, setSelectedGene, geneText, setGeneText, style,
    onKeyDown
  }
) => {
  const [geneOptions, setGeneOptions] = useState([]);

  useEffect(() => {
    if (selectedGene === '') {
      setGeneText('');
    } else {
      getGeneSuggestions(selectedGene).then(suggestResponseJson => {

        if (suggestResponseJson.warnings) {
          // if max matches exceeded, check for exact match
          if (suggestResponseJson.warnings[0].startsWith('Exceeds max matches')) {
            getGeneId(selectedGene).then(geneResponseJson => {
              if (geneResponseJson.warnings) {
                setGeneText('Unrecognized term');
              } else {
                setGeneText('');
              }
            });
          }
        } else if (suggestResponseJson.suggestions?.length === 0) {
          setGeneText('Unrecognized term');
        } else {
          const suggestions = [];
          suggestResponseJson.suggestions?.forEach(suggestion => {
            if (suggestion[0] === '') {
              suggestions.push(suggestion[2]);
            } else {
              suggestions.push(suggestion[0]);
            }
          });
          console.log(suggestions);
          setGeneOptions(suggestions);

          const termLower = selectedGene.toLowerCase();
          const index = suggestions.findIndex((element: string) => {
            return element.toLowerCase() === termLower;
          });
          if (index === -1) {
            setGeneText('Unrecognized term');
          } else {
            setGeneText('');
          }
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
          onChange={event => {
            setSelectedGene(event.target.value);
          }}
          onKeyDown={
            onKeyDown ?
              (e) => onKeyDown(e) :
              null
          }
          helperText={geneText !== '' ? geneText : null}
        />
      }
    />
  );
};
