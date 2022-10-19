import React, { useState, useEffect, KeyboardEvent } from "react";
import {
  TextField,
  FormControlLabel,
  Switch,
  makeStyles,
  Box,
} from "@material-ui/core";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import {
  getTemplatedSequenceElement,
  getTemplatedSequenceNomenclature,
} from "../../../../../services/main";
import { ClientTemplatedSequenceElement } from "../../../../../services/ResponseModels";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

const useStyles = makeStyles({
  switchLabel: {
    color: "rgba(0, 0, 0, 0.54)",
  },
  track: {
    backgroundColor: "grey !important",
    marginTop: "2px"
  }
});

interface TemplatedSequenceElementInputProps
  extends StructuralElementInputProps {
  element: ClientTemplatedSequenceElement;
}

const TemplatedSequenceElementInput: React.FC<
  TemplatedSequenceElementInputProps
> = ({ element, index, handleSave, handleDelete, icon }) => {
  const classes = useStyles();
  const [chromosome, setChromosome] = useState<string>(
    element.input_chromosome || ""
  );
  const [strand, setStrand] = useState<string>(element.strand || "+");
  const [startPosition, setStartPosition] = useState<string>(
    element.input_start || ""
  );
  const [endPosition, setEndPosition] = useState<string>(
    element.input_end || ""
  );
  const [inputError, setInputError] = useState<string>("");

  const inputComplete =
    chromosome !== "" &&
    strand !== "" &&
    startPosition !== "" &&
    endPosition !== "";
  const validated = inputComplete && inputError === "";

  const [expanded, setExpanded] = useState<boolean>(!validated);

  useEffect(() => {
    if (inputComplete) {
      buildTemplatedSequenceElement();
    }
  }, [chromosome, strand, startPosition, endPosition]);

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key == "Enter" && validated) {
      setExpanded(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStrand(e.target.checked ? "-" : "+")
  };

  const buildTemplatedSequenceElement = () => {
    getTemplatedSequenceElement(
      chromosome,
      strand,
      startPosition,
      endPosition
    ).then((templatedSequenceResponse) => {
      if (
        templatedSequenceResponse.warnings &&
        templatedSequenceResponse.warnings?.length > 0
      ) {
        // TODO visible error handling
        setInputError("element validation unsuccessful");
        return;
      } else if (templatedSequenceResponse.element) {
        setInputError("");
        getTemplatedSequenceNomenclature(
          templatedSequenceResponse.element
        ).then((nomenclatureResponse) => {
          if (nomenclatureResponse.nomenclature) {
            const templatedSequenceElement: ClientTemplatedSequenceElement = {
              ...templatedSequenceResponse.element,
              element_id: element.element_id,
              nomenclature: nomenclatureResponse.nomenclature,
              input_chromosome: chromosome,
              input_start: startPosition,
              input_end: endPosition,
            };
            handleSave(index, templatedSequenceElement);
          }
        });
      }
    });
  };

  const inputElements = (
    <>
      <div className="top-inputs">
        <TextField
          margin="dense"
          style={{ height: 38, width: 125 }}
          label="Chromosome"
          value={chromosome}
          onChange={(event) => setChromosome(event.target.value)}
          onKeyDown={handleEnterKey}
        />
        <Box mt="18px">
        <FormControlLabel control={
          <Switch onChange={handleChange} 
            classes={{track: classes.track}}
            checked={strand === "-"}
            icon={<AddCircleIcon color="primary" />}
            checkedIcon={<RemoveCircleIcon />}
            disableRipple
          />} 
          label="Strand"
          labelPlacement="start"
          classes={{label: classes.switchLabel}}
          />
        </Box>
      </div>
      <div className="bottom-inputs">
        <TextField
          margin="dense"
          style={{ height: 38, width: 125 }}
          label="Start Position"
          value={startPosition}
          onChange={handleChange}
          onKeyDown={handleEnterKey}
        />
        <TextField
          margin="dense"
          style={{ height: 38, width: 125 }}
          label="End Position"
          value={endPosition}
          onChange={(event) => setEndPosition(event.target.value)}
          onKeyDown={handleEnterKey}
        />
      </div>
    </>
  );

  return StructuralElementInputAccordion({
    expanded,
    setExpanded,
    element,
    handleDelete,
    inputElements,
    validated,
    icon,
  });
};

export default TemplatedSequenceElementInput;
