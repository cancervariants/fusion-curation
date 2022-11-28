import {
  Button,
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
import AddIcon from "@material-ui/icons/Add";
import UpdateIcon from "@material-ui/icons/Update";
import DeleteIcon from "@material-ui/icons/Delete";
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
}));

interface Props {
  regElement: ClientRegulatoryElement | undefined;
  setRegElement: CallableFunction;
  removeRegElement: CallableFunction;
  elementClass: RegulatoryClass | "default";
  setElementClass: CallableFunction;
  gene: string;
  setGene: CallableFunction;
  geneText: string;
  setGeneText: CallableFunction;
}

const RegElementForm: React.FC<Props> = ({
  regElement,
  setRegElement,
  removeRegElement,
  elementClass,
  setElementClass,
  gene,
  setGene,
  geneText,
  setGeneText,
}) => {
  const classes = useStyles();

  const inputComplete =
    elementClass !== "default" && gene !== "" && geneText === "";

  /**
   * Handle user click on "add" button
   * @returns nothing, but updates input fields and app fusion object
   */
  const handleAdd = () => {
    if (elementClass === "default") return;
    getRegulatoryElement(elementClass, gene).then((reResponse) => {
      if (reResponse.warnings && reResponse.warnings.length > 0) {
        throw new Error(reResponse.warnings[0]);
      }
      getRegElementNomenclature(reResponse.regulatory_element).then(
        (nomenclatureResponse) => {
          if (
            nomenclatureResponse.warnings &&
            nomenclatureResponse.warnings.length > 0
          ) {
            throw new Error(nomenclatureResponse.warnings[0]);
          }
          const newRegElement: ClientRegulatoryElement = {
            ...reResponse.regulatory_element,
            display_class: regulatoryClassItems[elementClass][1],
            nomenclature: nomenclatureResponse.nomenclature,
          };
          setRegElement(newRegElement);
        }
      );
    });
  };

  /**
   * Lookup table used to map raw regulatory class enum values to options for the class
   * drop-down menu and for display purposes. The boolean is for disabling selectability
   * on the drop-down menu, and the string is the displayed value.
   * It's not clear to me if Typescript can check these values for correctness if they change,
   * so any changes to the Pydantic RegulatoryClass class need to be reflected in the keys here.
   */
  const regulatoryClassItems = {
    default: [true, ""],
    attenuator: [false, "Attenuator"],
    caat_signal: [false, "CAAT signal"],
    enhancer: [false, "Enhancer"],
    enhancer_blocking_element: [false, "Enhancer Blocking Element"],
    gc_signal: [false, "GC Signal"],
    imprinting_control_region: [false, "Imprinting Control Region"],
    insulator: [false, "Insulator"],
    minus_35_signal: [false, "-35 Signal"],
    minus_10_signal: [false, "-10 Signal"],
    polya_signal_sequence: [false, "PolyA Signal Sequence"],
    promoter: [false, "Promoter"],
    response_element: [false, "Response Element"],
    ribosome_binding_site: [false, "Ribosome Binding Site"],
    riboswitch: [false, "Riboswitch"],
    silencer: [false, "Silencer"],
    tata_box: [false, "TATA Box"],
    teminator: [false, "Terminator"],
    other: [false, "Other"],
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

  return (
    <div className="form-container">
      <div className="formInput">
        <FormControl className={classes.formControl}>
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
              value={elementClass}
              onChange={(e) =>
                setElementClass(e.target.value as RegulatoryClass)
              }
            >
              {buildMenuItems()}
            </Select>
          </HelpTooltip>
        </FormControl>
      </div>
      <div className="formInput">
        <GeneAutocomplete
          gene={gene}
          setGene={setGene}
          geneText={geneText}
          setGeneText={setGeneText}
          style={{ width: 440 }}
          tooltipDirection="left"
        />
      </div>
      <div className="regel-buttons ">
        {regElement !== undefined ? (
          <Button
            startIcon={<DeleteIcon />}
            variant="outlined"
            color="secondary"
            onClick={() => removeRegElement()}
            className="regel-delete-button"
          >
            Remove
          </Button>
        ) : (
          <></>
        )}

        {regElement === undefined ? (
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            color="primary"
            onClick={() => handleAdd()}
            disabled={!inputComplete}
          >
            Add
          </Button>
        ) : (
          <Button
            startIcon={<UpdateIcon />}
            variant="outlined"
            color="primary"
            onClick={() => handleAdd()}
            disabled={!inputComplete}
          >
            Update
          </Button>
        )}
      </div>
    </div>
  );
};

export default RegElementForm;
