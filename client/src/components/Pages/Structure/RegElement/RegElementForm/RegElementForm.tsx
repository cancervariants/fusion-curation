import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";
import "./RegElementForm.scss";
import React from "react";
import { RegulatoryClass } from "../../../../../services/ResponseModels";
import HelpTooltip from "../../../../main/shared/HelpTooltip/HelpTooltip";
import { GeneAutocomplete } from "../../../../main/shared/GeneAutocomplete/GeneAutocomplete";

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
  gene: string;
  setGene: CallableFunction;
  geneText: string;
  setGeneText: CallableFunction;
}

const RegElementForm: React.FC<Props> = ({
  regulatoryClassItems,
  elementClass,
  setElementClass,
  gene,
  setGene,
  geneText,
  setGeneText,
}) => {
  const classes = useStyles();

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

  return (
    <div>
      <FormControl style={{ width: "100%" }}>
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
            onChange={(e) => setElementClass(e.target.value as RegulatoryClass)}
          >
            {buildMenuItems()}
          </Select>
        </HelpTooltip>
      </FormControl>
      <GeneAutocomplete
        gene={gene}
        setGene={setGene}
        geneText={geneText}
        setGeneText={setGeneText}
        tooltipDirection="left"
      />
    </div>
  );
};

export default RegElementForm;
