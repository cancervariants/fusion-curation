import React, { useState, useEffect, KeyboardEvent } from "react";
import { TextField, Typography } from "@material-ui/core";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import {
  getTemplatedSequenceElement,
  getTemplatedSequenceNomenclature,
} from "../../../../../services/main";
import { ClientTemplatedSequenceElement } from "../../../../../services/ResponseModels";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";
import HelpTooltip from "../../../../main/shared/HelpTooltip/HelpTooltip";
import ChromosomeField from "../../../../main/shared/ChromosomeField/ChromosomeField";

interface TemplatedSequenceElementInputProps
  extends StructuralElementInputProps {
  element: ClientTemplatedSequenceElement;
}

const TemplatedSequenceElementInput: React.FC<
  TemplatedSequenceElementInputProps
> = ({ element, handleSave, handleDelete, icon }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [chromosome, setChromosome] = useState<string>(
    element.inputChromosome || ""
  );
  const [strand, setStrand] = useState<string>(
    element.strand === 1 ? "+" : "-"
  );
  const [startPosition, setStartPosition] = useState<string>(
    element.inputStart !== null && element.inputStart !== undefined
      ? `${element.inputStart}`
      : ""
  );
  const [endPosition, setEndPosition] = useState<string>(
    element.inputEnd !== null && element.inputEnd !== undefined
      ? `${element.inputEnd}`
      : ""
  );
  const [inputError, setInputError] = useState<string>("");

  const inputComplete =
    chromosome !== "" &&
    strand !== "" &&
    startPosition !== "" &&
    endPosition !== "";
  const validated = inputComplete && inputError === "";

  const [expanded, setExpanded] = useState<boolean>(!validated);

  const [pendingResponse, setPendingResponse] = useState(false);

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
        setErrors(templatedSequenceResponse.warnings);
        setPendingResponse(false);
        return;
      } else if (templatedSequenceResponse.element) {
        setInputError("");
        setErrors([]);
        getTemplatedSequenceNomenclature(
          templatedSequenceResponse.element
        ).then((nomenclatureResponse) => {
          if (nomenclatureResponse.nomenclature) {
            const templatedSequenceElement: ClientTemplatedSequenceElement = {
              ...templatedSequenceResponse.element,
              elementId: element.elementId,
              nomenclature: nomenclatureResponse.nomenclature,
              region:
                templatedSequenceResponse?.element?.region || element.region,
              strand:
                templatedSequenceResponse?.element?.strand || element.strand,
              inputChromosome: chromosome,
              inputStart: startPosition,
              inputEnd: endPosition,
            };
            handleSave(templatedSequenceElement);
          }
        });
      }
      setPendingResponse(false);
    });
  };

  const inputElements = (
    <>
      <div className="top-inputs">
        <ChromosomeField
          fieldValue={chromosome}
          onChange={(event, _child) =>
            setChromosome(event.target.value as string)
          }
        />
      </div>
      <div className="bottom-inputs">
        <HelpTooltip
          placement="bottom"
          title={
            <Typography>
              The starting genomic position (residue) of the segment.
            </Typography>
          }
        >
          <TextField
            margin="dense"
            style={{ height: 38, width: 125 }}
            label="Starting Position"
            value={startPosition}
            onChange={(event) => setStartPosition(event.target.value)}
            onKeyDown={handleEnterKey}
          />
        </HelpTooltip>
        <HelpTooltip
          placement="bottom"
          title={
            <Typography>
              The ending genomic position (residue) of the segment.
            </Typography>
          }
        >
          <TextField
            margin="dense"
            style={{ height: 38, width: 125 }}
            label="Ending Position"
            value={endPosition}
            onChange={(event) => setEndPosition(event.target.value)}
            onKeyDown={handleEnterKey}
          />
        </HelpTooltip>
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
    errors,
    icon,
    pendingResponse,
  });
};

export default TemplatedSequenceElementInput;
