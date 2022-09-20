import React, { useState, useEffect } from "react";
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { getGeneId, getGeneSuggestions } from "../../../../services/main";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import {
  NormalizeGeneResponse,
  SuggestGeneResponse,
} from "../../../../services/ResponseModels";

interface Props {
  selectedGene: SuggestedGeneOption;
  setSelectedGene: CallableFunction;
  geneText: string;
  setGeneText: CallableFunction;
  style: CSSProperties;
}

export enum GeneSuggestionType {
  alias = "Alias",
  symbol = "Symbol",
  prevSymbol = "Previous Symbol",
  none = "",
}
export type SuggestedGeneOption = { value: string; type: GeneSuggestionType };

export const GeneAutocomplete: React.FC<Props> = ({
  selectedGene,
  setSelectedGene,
  geneText,
  setGeneText,
  style,
}) => {
  const [geneOptions, setGeneOptions] = useState<SuggestedGeneOption[]>([]);
  const [inputValue, setInputValue] = useState(selectedGene.value);

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
            tryExactMatch();
          }
        } else if (
          !suggestResponseJson.symbols &&
          !suggestResponseJson.prev_symbols &&
          !suggestResponseJson.aliases
        ) {
          setGeneText("Unrecognized term");
          setGeneOptions([]);
        } else {
          setGeneText("");
          setGeneOptions(buildOptions(suggestResponseJson));
        }
      });
    }
  }, [inputValue]);

  /**
   * Attempt exact match for entered text. Should be called if user-submitted text
   * isn't specific enough to narrow options down to a reasonable number (the
   * `MAX_SUGGESTIONS` value set server-side), in case their entered value
   * happens to match a real gene term.
   * No return value, but updates dropdown options if successful.
   */
  const tryExactMatch = () => {
    getGeneId(inputValue).then((geneResponseJson: NormalizeGeneResponse) => {
      if (geneResponseJson.warnings && geneResponseJson.warnings.length > 0) {
        setGeneText("Unrecognized term");
        setGeneOptions([]);
      } else {
        // just provide entered term, but correctly-cased
        setGeneText("");
        if (geneResponseJson.cased) {
          setGeneOptions([
            { value: geneResponseJson.cased, type: GeneSuggestionType.symbol },
          ]);
        }
      }
    });
  };

  /**
   * Construct options for use in MUI Autocomplete GroupBy
   * @param suggestResponse response from suggestions API received from server
   * @returns array of option objects
   */
  const buildOptions = (
    suggestResponse: SuggestGeneResponse
  ): SuggestedGeneOption[] => {
    const options: SuggestedGeneOption[] = [];
    if (suggestResponse.symbols) {
      suggestResponse.symbols.map((suggestion) =>
        options.push({ value: suggestion[0], type: GeneSuggestionType.symbol })
      );
    }
    if (suggestResponse.prev_symbols) {
      suggestResponse.prev_symbols.map((suggestion) =>
        options.push({
          value: suggestion[0],
          type: GeneSuggestionType.prevSymbol,
        })
      );
    }
    if (suggestResponse.aliases) {
      suggestResponse.aliases.map((suggestion) =>
        options.push({ value: suggestion[0], type: GeneSuggestionType.alias })
      );
    }
    return options;
  };

  // TODO resolve Typescript warning about `value` field
  // ALSO remove doesn't work?
  return (
    <Autocomplete
      value={selectedGene.value}
      onChange={(event, newValue) => {
        setSelectedGene(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={geneOptions}
      groupBy={(option) => (option ? option.type : "")}
      getOptionLabel={(option) => (option ? option.value : "")}
      getOptionSelected={(option, selected) => option.value === selected.value}
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
