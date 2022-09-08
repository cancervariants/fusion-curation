import React, { useState, useEffect } from "react";
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { getGeneId, getGeneSuggestions } from "../../../../services/main";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

interface Props {
  selectedGene: string;
  setSelectedGene: CallableFunction;
  geneText: string;
  setGeneText: CallableFunction;
  onKeyDown: CallableFunction;
  style: CSSProperties;
}

export const GeneAutocomplete: React.FC<Props> = ({
  selectedGene,
  setSelectedGene,
  geneText,
  setGeneText,
  style,
}) => {
  const [geneOptions, setGeneOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState(selectedGene);

  useEffect(() => {
    if (inputValue === "") {
      setGeneText("");
      setGeneOptions([]);
    } else {
      getGeneSuggestions(inputValue).then((suggestResponseJson) => {
        if (suggestResponseJson.warnings) {
          // max matches exceeded is currently the only possible warning
          if (
            suggestResponseJson.warnings[0].startsWith("Exceeds max matches")
          ) {
            // try exact match
            getGeneId(inputValue).then((geneResponseJson) => {
              if (
                geneResponseJson.warnings &&
                geneResponseJson.warnings.length > 0
              ) {
                setGeneText("Unrecognized term");
                setGeneOptions([]);
              } else {
                // just provide entered term, but correctly-cased
                setGeneText("");
                if (geneResponseJson.cased) {
                  setGeneOptions([geneResponseJson.cased]);
                }
              }
            });
          }
        } else if (suggestResponseJson.suggestions?.length === 0) {
          setGeneText("Unrecognized term");
          setGeneOptions([]);
        } else if (suggestResponseJson.suggestions) {
          setGeneText("");
          setGeneOptions(
            suggestResponseJson.suggestions
              .map((s) => (s[0] !== "" ? s[0] : s[2]))
              .sort()
          );
        }
      });
    }
  }, [inputValue]);

  return (
    <Autocomplete
      value={selectedGene}
      onChange={(event, newValue) => setSelectedGene(newValue)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      options={geneOptions}
      disableClearable
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label="Gene Symbol"
          margin="dense"
          style={style}
          error={geneText !== ""}
          helperText={geneText ? geneText : null}
        />
      )}
    />
  );
};
