import React, { useState, useEffect, ReactNode } from "react";
import { TextField, Typography, makeStyles } from "@material-ui/core";
import Autocomplete, {
  AutocompleteRenderGroupParams,
} from "@material-ui/lab/Autocomplete";
import { getGeneSuggestions } from "services/main";
import { SuggestGeneResponse } from "services/ResponseModels";
import HelpTooltip from "HelpTooltip/HelpTooltip";
import { useColorTheme } from "global/contexts/Theme/ColorThemeContext";

export enum GeneSuggestionType {
  conceptId = "Concept ID",
  alias = "Alias",
  symbol = "Symbol",
  prevSymbol = "Previous Symbol",
  none = "",
}

export type SuggestedGeneOption = {
  value: string;
  type: GeneSuggestionType | string;
  chromosome?: string;
  strand?: string;
};

const defaultGeneOption: SuggestedGeneOption = {
  value: "",
  type: GeneSuggestionType.none,
};

interface Props {
  gene: string;
  setGene: CallableFunction;
  geneText: string;
  setGeneText: CallableFunction;
  tooltipDirection?:
    | "bottom"
    | "left"
    | "right"
    | "top"
    | "bottom-end"
    | "bottom-start"
    | "left-end"
    | "left-start"
    | "right-end"
    | "right-start"
    | "top-end"
    | "top-start"
    | undefined;
  promptText?: string | undefined;
  setChromosome?: CallableFunction;
  setStrand?: CallableFunction;
}

export const GeneAutocomplete: React.FC<Props> = ({
  gene,
  setGene,
  geneText,
  setGeneText,
  tooltipDirection,
  promptText,
  setChromosome,
  setStrand,
}) => {
  const existingGeneOption = gene
    ? { value: gene, type: GeneSuggestionType.symbol }
    : defaultGeneOption;
  const [geneOptions, setGeneOptions] = useState<SuggestedGeneOption[]>([]);
  const [geneValue, setGeneValue] = useState(existingGeneOption);
  const [inputValue, setInputValue] = useState(existingGeneOption);
  const [loading, setLoading] = useState(false);

  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    autocompleteGroupHeader: {
      paddingLeft: "8px",
      color: colorTheme["--dark-gray"],
      fontSizeAdjust: "0.5",
    },
  }));
  const classes = useStyles();

  /**
   * Simple wrapper around state setters to ensure updates to local selected value are reflected
   * in the parent's copy
   * @param selection selected gene option
   */
  const updateSelection = (selection: SuggestedGeneOption) => {
    setGene(selection.value);
    setGeneValue(selection);
    if (setChromosome) {
      // substring is to remove identifier from beginning of chromosome (ex: result in NC_000007.14 instead of NCBI:NC_000007.14)
      setChromosome(
        selection.chromosome?.substring(selection.chromosome.indexOf(":") + 1)
      );
    }
    if (setStrand) {
      setStrand(selection.strand);
    }
  };

  // Update options
  useEffect(() => {
    if (inputValue.value === "") {
      setGeneText("");
      setGeneOptions([]);
      setLoading(false);
    } else {
      setLoading(true);
      getGeneSuggestions(inputValue.value).then((suggestResponseJson) => {
        setLoading(false);
        if (suggestResponseJson.matches_count === 0) {
          setGeneText("Unrecognized term");
          setGeneOptions([]);
        } else {
          setGeneText("");
          setGeneOptions(buildOptions(suggestResponseJson, inputValue.value));
        }
      });
    }
  }, [inputValue]);

  useEffect(() => {
    if (!gene) {
      setGeneValue(defaultGeneOption);
      setInputValue(defaultGeneOption);
    }
  }, [gene]);

  /**
   * Generate group HTML element. Needed to properly display text about # of other possible completions.
   * @param params group object processed by autocomplete
   * @returns group node to render
   */
  const makeGroup = (params: AutocompleteRenderGroupParams): ReactNode => {
    const children = params.group.includes("possible") ? [] : params.children;
    const groupElement = (
      <div key={params.key} className={classes.autocompleteGroupHeader}>
        {params.group}
      </div>
    );
    return [groupElement, children];
  };

  const buildOptions = (
    suggestResponse: SuggestGeneResponse,
    inputValue: string
  ): SuggestedGeneOption[] => {
    const options: SuggestedGeneOption[] = [];
    if (suggestResponse.concept_id) {
      suggestResponse.concept_id.map((suggestion) =>
        options.push({
          value: suggestion[0],
          type: GeneSuggestionType.conceptId,
          chromosome: suggestion[3],
          strand: suggestion[4],
        })
      );
    }
    if (suggestResponse.symbol) {
      suggestResponse.symbol.map((suggestion) =>
        options.push({
          value: suggestion[0],
          type: GeneSuggestionType.symbol,
          chromosome: suggestion[3],
          strand: suggestion[4],
        })
      );
    }
    if (suggestResponse.prev_symbols) {
      suggestResponse.prev_symbols.map((suggestion) =>
        options.push({
          value: suggestion[0],
          type: GeneSuggestionType.prevSymbol,
          chromosome: suggestion[3],
          strand: suggestion[4],
        })
      );
    }
    if (suggestResponse.aliases) {
      suggestResponse.aliases.map((suggestion) =>
        options.push({
          value: suggestion[0],
          type: GeneSuggestionType.alias,
          chromosome: suggestion[3],
          strand: suggestion[4],
        })
      );
    }
    // slightly hack-y way to insert message about number of possible options: create an option group
    // with the message as the group title, and then in `makeGroup()`, remove all of its child elements.
    // `value` needs to be set to `inputValue` (or another valid completion of user text) for the autocomplete object
    // to render the group at all
    if (suggestResponse.warnings) {
      suggestResponse.warnings.map((warn: string) => {
        if (warn.startsWith("Exceeds max matches")) {
          const maxExceededMsg =
            options.length > 0
              ? `+ ${suggestResponse.matches_count} possible options`
              : `${suggestResponse.matches_count} possible options`;
          options.push({
            value: inputValue,
            type: maxExceededMsg,
          });
        }
      });
    }
    return options;
  };

  return (
    <Autocomplete
      loading={loading}
      value={geneValue}
      style={{ minWidth: "150px" }}
      clearOnBlur={false}
      clearOnEscape
      disableClearable={inputValue.value === ""}
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
      renderGroup={makeGroup}
      getOptionLabel={(option) => (option.value ? option.value : "")}
      getOptionSelected={(option, selected) => {
        return option.value === selected.value;
      }}
      renderInput={(params) => (
        <HelpTooltip
          placement={tooltipDirection}
          title={
            <>
              <Typography>Associated gene term.</Typography>
              <Typography>
                We recommend using an HUGO Gene Nomenclature Committee (HGNC)
                symbol, but other kinds of referents (including aliases,
                deprecated terms, and concept IDs) are supported as well.
              </Typography>
            </>
          }
        >
          <TextField
            {...params}
            variant="standard"
            label={promptText ? promptText : "Gene Symbol"}
            margin="dense"
            style={{ minWidth: "250px !important" }}
            error={geneText !== ""}
            helperText={geneText ? geneText : null}
          />
        </HelpTooltip>
      )}
    />
  );
};
