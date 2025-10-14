import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";
import "./RegElementForm.scss";
import React, { ChangeEvent, useState } from "react";
import { RegulatoryClass } from "../../../../../services/ResponseModels";
import HelpTooltip from "../../../../main/shared/HelpTooltip/HelpTooltip";
import { GeneAutocomplete } from "../../../../main/shared/GeneAutocomplete/GeneAutocomplete";
import ChromosomeField from "../../../../main/shared/ChromosomeField/ChromosomeField";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: "80%",
  },
  classSelect: {
    width: "200px",
    height: "40px",
    alignItems: "center",
    backgroundColor: "white",
    marginTop: "5px",
    marginRight: "5px",
  },
}));

interface Props {
  regulatoryClassItems: object;
  elementClass: RegulatoryClass | "default";
  setElementClass: CallableFunction;
  featureId?: string;
  setFeatureId: CallableFunction;
  gene: string;
  setGene: CallableFunction;
  geneText: string;
  setGeneText: CallableFunction;
  chromosome?: string;
  setChromosome: CallableFunction;
  genomicStart?: string;
  setGenomicStart: CallableFunction;
  genomicEnd?: string;
  setGenomicEnd: CallableFunction;
}

const RegElementForm: React.FC<Props> = ({
  regulatoryClassItems,
  elementClass,
  setElementClass,
  featureId,
  setFeatureId,
  gene,
  setGene,
  geneText,
  setGeneText,
  chromosome,
  setChromosome,
  genomicStart,
  setGenomicStart,
  genomicEnd,
  setGenomicEnd,
}) => {
  const classes = useStyles();

  const [txStartingGenomicText, setTxStartingGenomicText] = useState("");
  const [txEndingGenomicText, setTxEndingGenomicText] = useState("");

  const inputComplete = gene === "";
  const validated = inputComplete;
  const [expanded, setExpanded] = useState<boolean>(!validated);

  /**
   * Handle pre-request validation for a numeric input field
   * @param value user-entered value
   * @param warnSetter useState setter function for warning text
   * @param valueSetter useState value setter function
   * @param positive if true, must be >= 0
   */
  const setNumericField = (
    value: string,
    warnSetter: CallableFunction,
    valueSetter: CallableFunction,
    positive: boolean
  ) => {
    const re = positive ? /^[0-9]*$/ : /^\-?[0-9]*$/;
    if (!value.match(re)) {
      warnSetter(`${positive ? "Nonzero i" : "I"}nteger required`);
    } else {
      warnSetter("");
    }
    valueSetter(value);
  };

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key == "Enter" && validated) {
      setExpanded(false);
    }
  };

  /**
   * Construct the regulatory class menu item array.
   * @returns list of MenuItems
   */
  const buildMenuItems = () => {
    return Object.keys(regulatoryClassItems).map((class_value, i) => (
      <MenuItem
        value={class_value}
        disabled={regulatoryClassItems[class_value][0]}
        key={i}
      >
        {regulatoryClassItems[class_value][1]}
      </MenuItem>
    ));
  };

  /**
   * Render transcript segment genomic coordinate fields
   * @returns start and end position input TextFields
   */
  const renderTxGenomicCoords = () => (
    <>
      <HelpTooltip
        placement="bottom"
        title={
          <Typography>
            The starting genomic position (residue) of the transcript segment.
          </Typography>
        }
      >
        <TextField
          margin="dense"
          InputLabelProps={{ shrink: true }}
          style={{ width: 300 }}
          label="Genomic Starting Position (Residue)"
          value={genomicStart}
          onChange={(event) =>
            setNumericField(
              event.target.value,
              setTxStartingGenomicText,
              setGenomicStart,
              true
            )
          }
          onKeyDown={handleEnterKey}
          error={txStartingGenomicText !== ""}
          helperText={
            txStartingGenomicText !== "" ? txStartingGenomicText : null
          }
        />
      </HelpTooltip>
      <HelpTooltip
        placement="bottom"
        title={
          <Typography>
            The ending genomic position (residue) of the transcript segment.
          </Typography>
        }
      >
        <TextField
          margin="dense"
          InputLabelProps={{ shrink: true }}
          style={{ width: 300 }}
          label="Genomic Ending Position (Residue)"
          value={genomicEnd}
          onChange={(event) =>
            setNumericField(
              event.target.value,
              setTxEndingGenomicText,
              setGenomicEnd,
              true
            )
          }
          onKeyDown={handleEnterKey}
          error={txEndingGenomicText !== ""}
          helperText={txEndingGenomicText !== "" ? txEndingGenomicText : null}
        />
      </HelpTooltip>
    </>
  );

  const handleChromosomeChange = (
    e: ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    setChromosome(e.target.value as string);
  };

  const genomicCoordinateInfo = (
    <>
      <Box className="mid-inputs">
        <ChromosomeField
          fieldValue={chromosome}
          onChange={handleChromosomeChange}
        />
      </Box>
      <Box className="bottom-inputs">{renderTxGenomicCoords()}</Box>
    </>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
        <FormControl style={{ flex: 1 }}>
          <InputLabel id="regulatory-element-class-label">Class</InputLabel>
          <HelpTooltip
            placement="left"
            title={
              <Typography>INSDC regulatory class vocabulary term.</Typography>
            }
          >
            <Select
              labelId="regulatory-element-class-label"
              id="regulatory-element-class"
              className={classes.classSelect}
              value={elementClass}
              onChange={(e) =>
                setElementClass(e.target.value as RegulatoryClass)
              }
            >
              {buildMenuItems()}
            </Select>
          </HelpTooltip>
        </FormControl>
        <HelpTooltip
          placement="bottom"
          title={
            <Typography>
              An optional identifier for the regulatory feature, e.g. registered
              cis-regulatory elements from ENCODE.
            </Typography>
          }
        >
          <TextField
            style={{ flex: 1 }}
            margin="dense"
            label="Feature ID"
            value={featureId}
            onChange={(event) => setFeatureId(event.target.value)}
            onKeyDown={(e) => {
              handleEnterKey;
            }}
          />
        </HelpTooltip>
      </div>
      <GeneAutocomplete
        gene={gene}
        setGene={setGene}
        geneText={geneText}
        setGeneText={setGeneText}
        tooltipDirection="left"
      />

      {genomicCoordinateInfo}
    </div>
  );
};

export default RegElementForm;
