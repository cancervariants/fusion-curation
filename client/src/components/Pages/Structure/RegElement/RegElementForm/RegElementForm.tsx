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
import {
  Setter,
  TxGenomicCoords,
} from "../../../../main/shared/TxGenomicCoords/TxGenomicCoords";
import { setNumericField } from "../../../../Utilities/SetNumericField/SetNumericField";

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
  featureId: string;
  setFeatureId: CallableFunction;
  gene: string;
  setGene: CallableFunction;
  geneText: string;
  setGeneText: CallableFunction;
  chromosome: string;
  setChromosome: CallableFunction;
  genomicStart: string;
  setGenomicStart: Setter<string>;
  genomicEnd: string;
  setGenomicEnd: Setter<string>;
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
  const [, setExpanded] = useState<boolean>(!validated);

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      <Box className="bottom-inputs">
        <TxGenomicCoords
          genomicStart={genomicStart}
          genomicEnd={genomicEnd}
          txStartingGenomicText={txStartingGenomicText}
          txEndingGenomicText={txEndingGenomicText}
          setTxStartingGenomicText={setTxStartingGenomicText}
          setTxEndingGenomicText={setTxEndingGenomicText}
          setGenomicStart={setGenomicStart}
          setGenomicEnd={setGenomicEnd}
          setNumericField={setNumericField}
          handleEnterKey={handleEnterKey}
        />
      </Box>
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
            onKeyDown={() => {
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
