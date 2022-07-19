import { TextField } from "@material-ui/core";
import { useEffect, useState } from "react";
import { ClientLinkerElement } from "../../../../../services/ResponseModels";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";

interface LinkerElementInputProps extends StructuralElementInputProps {
  element: ClientLinkerElement;
}

const LinkerElementInput: React.FC<LinkerElementInputProps> = ({
  element,
  index,
  handleSave,
  handleDelete,
}) => {
  // bases
  const [sequence, setSequence] = useState<string>(
    element.linker_sequence?.sequence || ""
  );
  const linkerError =
    Boolean(sequence) && sequence.match(/^([aAgGtTcC]+)?$/) === null;
  const validated = Boolean(sequence && !linkerError);
  const [expanded, setExpanded] = useState<boolean>(!validated);

  useEffect(() => {
    if (validated) buildLinkerElement();
  }, [sequence]);

  const buildLinkerElement = () => {
    const linkerElement: ClientLinkerElement = {
      ...element,
      linker_sequence: {
        id: `fusor.sequence:${sequence}`,
        type: "SequenceDescriptor",
        sequence: sequence,
        residue_type: "SO:0000348",
      },
      element_name: sequence,
      hr_name: sequence,
    };
    handleSave(index, linkerElement);
  };

  const inputElements = (
    <TextField
      margin="dense"
      label="Sequence"
      value={sequence}
      onChange={(event) => setSequence(event.target.value.toUpperCase())}
      error={linkerError}
      helperText={linkerError ? "Only {A, C, G, T} permitted" : null}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !linkerError) {
          setExpanded(false);
        }
      }}
    />
  );

  return StructuralElementInputAccordion({
    expanded,
    setExpanded,
    element,
    handleDelete,
    inputElements,
    validated,
  });
};

export default LinkerElementInput;
