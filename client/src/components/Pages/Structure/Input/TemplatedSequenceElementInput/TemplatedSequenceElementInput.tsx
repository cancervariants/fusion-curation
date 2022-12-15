import React, { useState, useEffect, KeyboardEvent } from "react";
import { TextField, Box, Typography } from "@material-ui/core";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import {
  getTemplatedSequenceElement,
  getTemplatedSequenceNomenclature,
} from "../../../../../services/main";
import { ClientTemplatedSequenceElement } from "../../../../../services/ResponseModels";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";
import StrandSwitch from "../../../../main/shared/StrandSwitch/StrandSwitch";
import HelpTooltip from "../../../../main/shared/HelpTooltip/HelpTooltip";

interface TemplatedSequenceElementInputProps
  extends StructuralElementInputProps {
  element: ClientTemplatedSequenceElement;
}

const TemplatedSequenceElementInput: React.FC<
  TemplatedSequenceElementInputProps
> = ({ element, index, handleSave, handleDelete, icon }) => {
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
        <HelpTooltip
          placement="bottom"
          title={
            <>
              <Typography>The chromosome on which the segment lies.</Typography>
              <Typography>
                RefSeq identifiers (e.g.{" "}
                <Typography variant="overline">NC_000001.11</Typography>) are
                preferred.
              </Typography>
            </>
          }
        >
          <TextField
            margin="dense"
            style={{ height: 38, width: 125 }}
            label="Chromosome"
            value={chromosome}
            onChange={(event) => setChromosome(event.target.value)}
            onKeyDown={handleEnterKey}
          />
        </HelpTooltip>
        <Box mt="18px">
          <StrandSwitch setStrand={setStrand} selectedStrand={strand} />
        </Box>
      </div>
      <div className="bottom-inputs">
        <HelpTooltip
          placement="bottom"
          title={
            <Typography>
              The starting genomic position of the segment. 1-indexed.
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
              The ending genomic position of the segment. 1-indexed.
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
    icon,
  });
};

export default TemplatedSequenceElementInput;
