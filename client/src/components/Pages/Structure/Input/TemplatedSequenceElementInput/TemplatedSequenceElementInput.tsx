import React, { useState, useEffect, KeyboardEvent } from "react";
import {
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
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

const REFSEQ_CHROMOSOME_IDENTIFIERS = [
  { identifier: "NC_000001.11", shorthand: "chr1" },
  { identifier: "NC_000002.12", shorthand: "chr2" },
  { identifier: "NC_000003.12", shorthand: "chr3" },
  { identifier: "NC_000004.12", shorthand: "chr4" },
  { identifier: "NC_000005.10", shorthand: "chr5" },
  { identifier: "NC_000006.12", shorthand: "chr6" },
  { identifier: "NC_000007.14", shorthand: "chr7" },
  { identifier: "NC_000008.11", shorthand: "chr8" },
  { identifier: "NC_000009.12", shorthand: "chr9" },
  { identifier: "NC_000010.11", shorthand: "chr10" },
  { identifier: "NC_000011.10", shorthand: "chr11" },
  { identifier: "NC_000012.12", shorthand: "chr12" },
  { identifier: "NC_000013.11", shorthand: "chr13" },
  { identifier: "NC_000014.9", shorthand: "chr14" },
  { identifier: "NC_000015.10", shorthand: "chr15" },
  { identifier: "NC_000016.10", shorthand: "chr16" },
  { identifier: "NC_000017.11", shorthand: "chr17" },
  { identifier: "NC_000018.10", shorthand: "chr18" },
  { identifier: "NC_000019.10", shorthand: "chr19" },
  { identifier: "NC_000020.11", shorthand: "chr20" },
  { identifier: "NC_000021.9", shorthand: "chr21" },
  { identifier: "NC_000022.11", shorthand: "chr22" },
  { identifier: "NC_000023.11", shorthand: "chrX" },
  { identifier: "NC_000024.10", shorthand: "chrY" },
];

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
        <FormControl variant="standard" fullWidth>
          <InputLabel id="chromosome-select-label">
            Select Chromosome
          </InputLabel>
          <Select
            labelId="chromosome-select-label"
            value={chromosome}
            onChange={(event) => setChromosome(event.target.value)}
          >
            {REFSEQ_CHROMOSOME_IDENTIFIERS.map((chr) => (
              <MenuItem key={chr.identifier} value={chr.identifier}>
                {chr.identifier} (GRCh38:{chr.shorthand})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
