import React, { useState, useEffect, KeyboardEvent } from "react";
import { TextField, Box } from "@material-ui/core";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import { ClientRegulatoryElement, ClientTemplatedSequenceElement, RegulatoryElement } from "../../../../../services/ResponseModels";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";
import StrandSwitch from "../../../../main/shared/StrandSwitch/StrandSwitch";
import RegElementForm from "../../../RegElement/RegElementForm/RegElementForm";
import { RegElement } from "../../../RegElement/Main/RegElement";

interface RegulatoryElementInputProps
  extends StructuralElementInputProps {
  element: ClientRegulatoryElement;
}

const RegulatoryElementInput: React.FC<
RegulatoryElementInputProps
> = ({ element, index, handleSave, handleDelete, icon }) => {
  const [inputError, setInputError] = useState<string>("");

  const inputComplete = true;
  const validated = inputComplete && inputError === "";

  const [expanded, setExpanded] = useState<boolean>(!validated || true);

  // TODO: implement validation
  // useEffect(() => {
  //   if (inputComplete) {
  //     buildTemplatedSequenceElement();
  //   }
  // }, [chromosome, strand, startPosition, endPosition]);

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key == "Enter" && validated) {
      setExpanded(false);
    }
  };

  const inputElements = (
    <>
      <RegElement />
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

export default RegulatoryElementInput;
