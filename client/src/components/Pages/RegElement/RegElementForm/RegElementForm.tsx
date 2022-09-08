import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";
import { useContext, useState, KeyboardEvent } from "react";
import { v4 as uuid } from "uuid";
import { FusionContext } from "../../../../global/contexts/FusionContext";
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

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: "80%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const RegElementForm: React.FC = () => {
  const classes = useStyles();

  const { fusion, setFusion } = useContext(FusionContext);
  const regElements = fusion.regulatory_elements;

  const [elementClass, setElementClass] = useState<RegulatoryClass | "default">(
    "default"
  );
  const [gene, setGene] = useState<string>("");
  const [geneText, setGeneText] = useState<string>("");

  const inputComplete =
    elementClass !== "default" && gene !== "" && geneText === "";

  const handleTypeChange = (event) => {
    setElementClass(event.target.value);
  };

  // const handleEnterKey = (e: KeyboardEvent) => {
  //   if (e.key == "Enter" && inputComplete) {
  //     handleAdd();
  //   }
  // };

  const handleAdd = () => {
    if (elementClass === "default") return;
    getRegulatoryElement(elementClass, gene).then((reResponse) => {
      if (reResponse.warnings && reResponse.warnings.length > 0) {
        throw new Error(reResponse.warnings[0]);
      }

      getRegElementNomenclature(reResponse.regulatory_element)
        .then((nomResponse) => {
          if (nomResponse.warnings && nomResponse.warnings.length > 0) {
            throw new Error(nomResponse.warnings[0]);
          }

          const newRegElement: ClientRegulatoryElement = {
            ...reResponse.regulatory_element,
            element_id: uuid(),
            hr_class:
              regulatoryClassItems[
                reResponse.regulatory_element.regulatory_class
              ],
            hr_name: nomResponse.nomenclature as string,
          };

          const cloneArray = Array.from(regElements);
          cloneArray.push(newRegElement);
          setFusion({ ...fusion, ...{ regulatory_elements: cloneArray } });
          setGene("");
          setElementClass("default");
        })
        .catch((error) => console.log(error));
    });
  };

  /**
   * Lookup table used to map raw regulatory class enum values to options for the class
   * drop-down menu and for display purposes.
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
          <Select
            labelId="regulatory-element-class-label"
            id="regulatory-element-class"
            value={elementClass}
            onChange={handleTypeChange}
          >
            {buildMenuItems()}
          </Select>
        </FormControl>
      </div>
      <div className="formInput">
        <GeneAutocomplete
          selectedGene={gene}
          setSelectedGene={setGene}
          geneText={geneText}
          setGeneText={setGeneText}
          style={{ width: 440 }}
        />
      </div>
      <div className="regel-add-button ">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleAdd()}
          disabled={!inputComplete}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default RegElementForm;
