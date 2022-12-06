import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";
import {
  getRegElementNomenclature,
  getRegulatoryElement,
} from "../../../../services/main";
import {
  ClientRegulatoryElement,
  RegulatoryClass,
} from "../../../../services/ResponseModels";
import { GeneAutocomplete } from "../../../main/shared/GeneAutocomplete/GeneAutocomplete";
import "./RegElementForm.scss";
import React from "react";
import HelpTooltip from "../../../main/shared/HelpTooltip/HelpTooltip";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: "80%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
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
  regulatoryClassItems: any;
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
   * Handle user click on "add" button
   * @returns nothing, but updates input fields and app fusion object
   */
  // const handleAdd = () => {
  //   if (elementClass === "default") return;
  //   getRegulatoryElement(elementClass, gene).then((reResponse) => {
  //     if (reResponse.warnings && reResponse.warnings.length > 0) {
  //       throw new Error(reResponse.warnings[0]);
  //     }
  //     getRegElementNomenclature(reResponse.regulatory_element).then(
  //       (nomenclatureResponse) => {
  //         if (
  //           nomenclatureResponse.warnings &&
  //           nomenclatureResponse.warnings.length > 0
  //         ) {
  //           throw new Error(nomenclatureResponse.warnings[0]);
  //         }
  //         const newRegElement: ClientRegulatoryElement = {
  //           ...reResponse.regulatory_element,
  //           display_class: regulatoryClassItems[elementClass][1],
  //           nomenclature: nomenclatureResponse.nomenclature,
  //         };
  //         setRegElement(newRegElement);
  //       }
  //     );
  //   });
  // };

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
        <FormControl>
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
