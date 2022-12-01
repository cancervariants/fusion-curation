import React, { useState, useEffect } from "react";
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { getGeneId, getGeneSuggestions } from "../../../../services/main";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import {
  NormalizeGeneResponse,
  SuggestGeneResponse,
} from "../../../../services/ResponseModels";

export enum GeneSuggestionType {
  conceptId = "Concept ID",
  alias = "Alias",
  symbol = "Symbol",
  prevSymbol = "Previous Symbol",
  none = "",
}
export type SuggestedGeneOption = { value: string; type: GeneSuggestionType };

const defaultGeneOption: SuggestedGeneOption = {
  value: "",
  type: GeneSuggestionType.none,
};

interface Props {
  gene: string;
  setGene: CallableFunction;
  geneText: string;
  setGeneText: CallableFunction;
  style: CSSProperties;
}

export const GeneAutocomplete: React.FC<Props> = ({
  gene,
  setGene,
  geneText,
  setGeneText,
  style,
}) => {
  const existingGeneOption = gene
    ? { value: gene, type: GeneSuggestionType.symbol }
    : defaultGeneOption;
  const [geneOptions, setGeneOptions] = useState<SuggestedGeneOption[]>([]);
  const [geneValue, setGeneValue] = useState(existingGeneOption);
  const [inputValue, setInputValue] = useState(existingGeneOption);

  /**
   * Simple wrapper around state setters to ensure updates to local selected value are reflected
   * in the parent's copy
   * @param selection selected gene option
   */
  const updateSelection = (selection: SuggestedGeneOption) => {
    setGene(selection.value);
    setGeneValue(selection);
  };

  // Update options
  useEffect(() => {
    if (inputValue.value === "") {
      setGeneText("");
      setGeneOptions([]);
    } else {
      const delayDebounce = setTimeout(() => {
        getGeneSuggestions(inputValue.value).then((suggestResponseJson) => {
          if (
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
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [inputValue]);

  useEffect(() => {
    if (!gene) {
      setGeneValue(defaultGeneOption);
      setInputValue(defaultGeneOption);
    }
  }, [gene]);

  /**
   * Attempt exact match for entered text. Should be called if user-submitted text
   * isn't specific enough to narrow options down to a reasonable number (the
   * `MAX_SUGGESTIONS` value set server-side), in case their entered value
   * happens to match a real gene term.
   * No return value, but updates dropdown options if successful.
   */
  const tryExactMatch = (input: string) => {
    getGeneId(input).then((geneResponseJson: NormalizeGeneResponse) => {
      // just provide entered term, but correctly-cased
      setGeneText("");
      if (geneResponseJson.cased) {
        setGeneOptions([
          {
            value: geneResponseJson.cased,
            type: geneResponseJson.cased.match(/^\w[^:]*:.+$/)
              ? GeneSuggestionType.conceptId
              : GeneSuggestionType.symbol,
          },
        ]);
      }
    });
  };

  // if geneOptions is empty, try an exact match (note: keep this useEffect separately, as we want to do this after all of the autocomplete lookups)
  useEffect(() => {
    if (!geneOptions.length) {
      tryExactMatch(inputValue.value);
    }
  }, [geneOptions]);

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

  return (
    <Autocomplete
      debug
      value={geneValue}
      onChange={(_, newValue) => {
        if (newValue) {
          updateSelection(newValue);
        } else {
          updateSelection(defaultGeneOption);
        }
      }}
      inputValue={inputValue.value}
      onInputChange={(_, newInputValue) => {
        setInputValue({ ...inputValue, value: newInputValue });
      }}
      options={geneOptions}
      groupBy={(option) => (option ? option.type : "")}
      getOptionLabel={(option) => (option.value ? option.value : "")}
      getOptionSelected={(option, selected) => {
        return option.value === selected.value;
      }}
      clearOnBlur={false}
      clearOnEscape
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
