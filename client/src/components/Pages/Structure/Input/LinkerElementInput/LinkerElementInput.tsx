import { TextField, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { ClientLinkerElement } from "../../../../../services/ResponseModels";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";
import HelpTooltip from "../../../../main/shared/HelpTooltip/HelpTooltip";

interface LinkerElementInputProps extends StructuralElementInputProps {
  element: ClientLinkerElement;
}

const LinkerElementInput: React.FC<LinkerElementInputProps> = ({
  element,
  index,
  handleSave,
  handleDelete,
  icon,
}) => {
  // bases
  const [sequence, setSequence] = useState<string>(
    element.linkerSequence?.sequence || ""
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
      linkerSequence: {
        id: `fusor.sequence:${sequence}`,
        type: "LiteralSequenceExpression",
        sequence: sequence,
      },
      nomenclature: sequence,
    };
    handleSave(linkerElement);
  };

  const inputElements = (
    <HelpTooltip
      placement="bottom"
      title={<Typography>A literal sequence expressed as cDNA.</Typography>}
    >
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
    </HelpTooltip>
  );

  return StructuralElementInputAccordion({
    expanded,
    setExpanded,
    element,
    handleDelete,
    inputElements,
    validated,
    errors: linkerError ? ["Invalid linker sequence"] : [],
    icon,
  });
};

export default LinkerElementInput;
