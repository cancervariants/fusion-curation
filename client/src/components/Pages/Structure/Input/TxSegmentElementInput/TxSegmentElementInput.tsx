import { TextField, MenuItem, Typography } from "@material-ui/core";
import {
  ClientTranscriptSegmentElement,
  TranscriptSegmentElement,
  TxSegmentElementResponse,
} from "../../../../../services/ResponseModels";
import React, { useEffect, useState, KeyboardEvent, useContext } from "react";
import {
  getTxSegmentElementEC,
  getTxSegmentElementGC,
  getTxSegmentNomenclature,
} from "../../../../../services/main";
import { GeneAutocomplete } from "../../../../main/shared/GeneAutocomplete/GeneAutocomplete";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";
import { FusionContext } from "../../../../../global/contexts/FusionContext";
import StrandSwitch from "../../../../main/shared/StrandSwitch/StrandSwitch";
import HelpTooltip from "../../../../main/shared/HelpTooltip/HelpTooltip";
import ChromosomeField from "../../../../main/shared/ChromosomeField/ChromosomeField";
import TranscriptField from "../../../../main/shared/TranscriptField/TranscriptField";
import { Box, FormControl, InputLabel, Select } from "@mui/material";

interface TxSegmentElementInputProps extends StructuralElementInputProps {
  element: ClientTranscriptSegmentElement;
}

export enum InputType {
  default = "default",
  gc = "genomic_coords",
  ec = "exon_coords",
}

const TxSegmentCompInput: React.FC<TxSegmentElementInputProps> = ({
  element,
  index,
  handleSave,
  handleDelete,
  icon,
}) => {
  const { fusion } = useContext(FusionContext);

  const [txInputType, setTxInputType] = useState<InputType>(
    (element.inputType as InputType) || InputType.default
  );

  // "Text" variables refer to helper or warning text to set under input fields
  // TODO: this needs refactored so badly
  const [txAc, setTxAc] = useState(element.inputTx || "");
  const [txAcText, setTxAcText] = useState("");

  const [txGene, setTxGene] = useState(element.inputGene || "");
  const [txGeneText, setTxGeneText] = useState("");

  const [txStrand, setTxStrand] = useState<string>(
    element.inputStrand === 1 ? "+" : "-"
  );

  const [txChrom, setTxChrom] = useState(element.inputChr || "");

  const [txStartingGenomic, setTxStartingGenomic] = useState(
    element.inputGenomicStart || ""
  );
  const [txStartingGenomicText, setTxStartingGenomicText] = useState("");
  const [txEndingGenomic, setTxEndingGenomic] = useState(
    element.inputGenomicEnd || ""
  );
  const [txEndingGenomicText, setTxEndingGenomicText] = useState("");

  const [startingExon, setStartingExon] = useState(element.exonStart || "");
  const [startingExonText, setStartingExonText] = useState("");
  const [endingExon, setEndingExon] = useState(element.exonEnd || "");
  const [endingExonText, setEndingExonText] = useState("");
  const [startingExonOffset, setStartingExonOffset] = useState(
    element.exonStartOffset || ""
  );
  const [startingExonOffsetText, setStartingExonOffsetText] = useState("");
  const [endingExonOffset, setEndingExonOffset] = useState(
    element.exonEndOffset || ""
  );
  const [endingExonOffsetText, setEndingExonOffsetText] = useState("");

  const [geneTranscripts, setGeneTranscripts] = useState([]);
  const [selectedTranscript, setSelectedTranscript] = useState("");

  const [pendingResponse, setPendingResponse] = useState(false);

  /*
  Depending on this element's location in the structure array, the user
  needs to provide some kind of coordinate input for either one or both ends
  of the element. This can change as the user drags the element around the structure
  array, or adds other elements to the array.
  */
  const hasRequiredEnds =
    index !== 0 && index < fusion.length
      ? (txStartingGenomic && txEndingGenomic) || (startingExon && endingExon)
      : index === 0
      ? txEndingGenomic || endingExon
      : txStartingGenomic || startingExon;

  // programming horror
  const inputComplete =
    (txInputType === InputType.gc &&
      txGene !== "" &&
      txChrom !== "" &&
      selectedTranscript !== "" &&
      (txStartingGenomic !== "" || txEndingGenomic !== "")) ||
    (txInputType === InputType.ec &&
      txAc !== "" &&
      (startingExon !== "" || endingExon !== ""));

  const validated: boolean =
    inputComplete &&
    hasRequiredEnds &&
    txGeneText === "" &&
    txAcText === "" &&
    txStartingGenomicText === "" &&
    txEndingGenomicText === "" &&
    startingExonText === "" &&
    startingExonOffsetText === "" &&
    endingExonText === "" &&
    endingExonOffsetText === "";

  const [expanded, setExpanded] = useState<boolean>(!validated);

  useEffect(() => {
    if (inputComplete) {
      buildTranscriptSegmentElement();
    }
  }, [
    txAc,
    txGene,
    txStrand,
    txChrom,
    txStartingGenomic,
    txEndingGenomic,
    startingExon,
    endingExon,
    startingExonOffset,
    endingExonOffset,
    index,
  ]);

  const handleTxElementResponse = (
    txSegmentResponse: TxSegmentElementResponse,
    inputParams: Record<string, string>
  ) => {
    const responseElement =
      txSegmentResponse.element as TranscriptSegmentElement;
    const finishedElement: ClientTranscriptSegmentElement = {
      ...element,
      ...responseElement,
      ...inputParams,
    };
    if (!hasRequiredEnds) {
      finishedElement.nomenclature = "ERROR";
    } else {
      getTxSegmentNomenclature(responseElement).then((nomenclatureResponse) => {
        if (
          !nomenclatureResponse.warnings &&
          nomenclatureResponse.nomenclature
        ) {
          finishedElement.nomenclature = nomenclatureResponse.nomenclature;
          handleSave(index, finishedElement);
        }
      });
    }
    setPendingResponse(false);
  };

  const handleTranscriptSelect = (event: any) => {
    setSelectedTranscript(event.target.value as string);
    setTxAc(event.target.value as string);
  };

  /**
   * Check for, and handle, warnings about invalid genomic coord values. Called by
   * constructor methods.
   * @param responseWarnings warnings property of transcript segment response object
   */
  const CheckGenomicCoordWarning = (responseWarnings: string[]) => {
    if (txStartingGenomic !== "") {
      const warning = `Unable to find a result for chromosome ${txChrom} where genomic coordinate ${txStartingGenomic} is mapped between an exon's start and end coordinates`;
      if (responseWarnings.find((e) => e.startsWith(warning))) {
        setTxStartingGenomicText("Out of range");
      }
    }
    if (txEndingGenomic !== "") {
      const warning = `Unable to find a result for chromosome ${txChrom} where genomic coordinate ${txEndingGenomic} is mapped between an exon's start and end coordinates`;
      if (responseWarnings.find((e) => e.startsWith(warning))) {
        setTxEndingGenomicText("Out of range");
      }
    }
    setPendingResponse(false);
  };

  /**
   * Reset warnings related to genomic coordinate values
   */
  const clearGenomicCoordWarnings = () => {
    setTxStartingGenomicText("");
    setTxEndingGenomicText("");
  };

  /**
   * Reset warnings related to exon coordinate values
   */
  const clearExonWarnings = () => {
    setStartingExonText("");
    setStartingExonOffsetText("");
    setEndingExonText("");
    setEndingExonOffsetText("");
  };

  console.log(pendingResponse);

  /**
   * Request construction of tx segment element from server and handle response
   */
  const buildTranscriptSegmentElement = () => {
    setPendingResponse(true);
    // fire constructor request
    switch (txInputType) {
      case InputType.gc:
        clearGenomicCoordWarnings();
        getTxSegmentElementGC(
          txGene,
          txChrom,
          selectedTranscript,
          txStartingGenomic,
          txEndingGenomic,
          txStrand
        ).then((txSegmentResponse) => {
          if (
            txSegmentResponse.warnings &&
            txSegmentResponse.warnings?.length > 0
          ) {
            CheckGenomicCoordWarning(txSegmentResponse.warnings);
          } else {
            const inputParams = {
              inputType: txInputType,
              inputStrand: txStrand,
              inputGene: txGene,
              inputChr: txChrom,
              inputGenomicStart: txStartingGenomic,
              inputGenomicEnd: txEndingGenomic,
            };
            handleTxElementResponse(txSegmentResponse, inputParams);
          }
        });
        break;
      case InputType.ec:
        getTxSegmentElementEC(
          txAc,
          startingExon as string,
          endingExon as string,
          startingExonOffset as string,
          endingExonOffset as string
        ).then((txSegmentResponse) => {
          if (
            txSegmentResponse.warnings &&
            txSegmentResponse.warnings?.length > 0
          ) {
            // transcript invalid
            const txWarning = `Unable to get exons for ${txAc}`;
            if (txSegmentResponse.warnings.includes(txWarning)) {
              setTxAcText("Unrecognized value");
            }
            // exon(s) invalid
            if (startingExon !== undefined) {
              const startWarning = `Exon ${startingExon} does not exist on ${txAc}`;
              if (txSegmentResponse.warnings.includes(startWarning)) {
                setStartingExonText("Invalid");
              }
            }
            if (endingExon !== undefined) {
              const endWarning = `Exon ${endingExon} does not exist on ${txAc}`;
              if (txSegmentResponse.warnings.includes(endWarning)) {
                setEndingExonText("Invalid");
              }
            }
          } else {
            setTxAcText("");
            setStartingExonText("");
            setEndingExonText("");
            const inputParams = {
              inputType: txInputType,
              inputTx: txAc,
            };
            handleTxElementResponse(txSegmentResponse, inputParams);
          }
        });
    }
  };

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key == "Enter" && validated) {
      setExpanded(false);
    }
  };

  /**
   * Handle pre-request validation for a numeric input field
   * @param value user-entered value
   * @param warnSetter useState setter function for warning text
   * @param valueSetter useState value setter function
   * @param positive if true, must be >= 0
   */
  const setNumericField = (
    value: string,
    warnSetter: CallableFunction,
    valueSetter: CallableFunction,
    positive: boolean
  ) => {
    const re = positive ? /^[0-9]*$/ : /^\-?[0-9]*$/;
    if (!value.match(re)) {
      warnSetter(`${positive ? "Nonzero i" : "I"}nteger required`);
    } else {
      warnSetter("");
    }
    valueSetter(value);
  };

  /**
   * Render transcript segment genomic coordinate fields
   * @returns start and end position input TextFields
   */
  const renderTxGenomicCoords = () => (
    <>
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
          style={{ width: 125 }}
          label="Starting Position"
          value={txStartingGenomic}
          onChange={(event) =>
            setNumericField(
              event.target.value,
              setTxStartingGenomicText,
              setTxStartingGenomic,
              true
            )
          }
          onKeyDown={handleEnterKey}
          error={txStartingGenomicText !== ""}
          helperText={
            txStartingGenomicText !== "" ? txStartingGenomicText : null
          }
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
          style={{ width: 125 }}
          label="Ending Position"
          value={txEndingGenomic}
          onChange={(event) =>
            setNumericField(
              event.target.value,
              setTxEndingGenomicText,
              setTxEndingGenomic,
              true
            )
          }
          onKeyDown={handleEnterKey}
          error={txEndingGenomicText !== ""}
          helperText={txEndingGenomicText !== "" ? txEndingGenomicText : null}
        />
      </HelpTooltip>
    </>
  );

  const txInputField = (
    <Box className="mid-inputs" minWidth="255px">
      <TranscriptField
        fieldValue={txAc}
        valueSetter={setTxAc}
        errorText={txAcText}
        keyHandler={handleEnterKey}
      />
    </Box>
  );

  const genomicCoordinateInfo = (
    <>
      <Box className="mid-inputs">
        <ChromosomeField fieldValue={txChrom} />
        <Box mt="18px" width="125px">
          <StrandSwitch setStrand={setTxStrand} selectedStrand={txStrand} />
        </Box>
      </Box>
      <Box className="bottom-inputs">{renderTxGenomicCoords()}</Box>
    </>
  );

  const renderTxOptions = () => {
    switch (txInputType) {
      case InputType.gc:
        return (
          <Box>
            <Box className="mid-inputs" minWidth="325px">
              <GeneAutocomplete
                gene={txGene}
                setGene={setTxGene}
                tooltipDirection="bottom"
                geneText={txGeneText}
                setGeneText={setTxGeneText}
                setChromosome={setTxChrom}
                setStrand={setTxStrand}
                setTranscripts={setGeneTranscripts}
                setDefaultTranscript={setSelectedTranscript}
              />
              <FormControl variant="standard">
                <InputLabel id="transcript-select-label">Transcript</InputLabel>
                <Select
                  labelId="transcript-select-label"
                  id="transcript-select"
                  value={selectedTranscript}
                  label="Transcript"
                  onChange={handleTranscriptSelect}
                  placeholder="Transcript"
                  style={{ minWidth: "150px" }}
                >
                  {geneTranscripts.map((tx, index) => (
                    <MenuItem key={index} value={tx}>
                      {tx}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {genomicCoordinateInfo}
          </Box>
        );
      case InputType.ec:
        return (
          <Box>
            {txInputField}
            <Box className="bottom-inputs">
              <HelpTooltip
                placement="bottom"
                title={
                  <Typography>
                    The starting exon number counted from the 5&#39; end of the
                    transcript.
                  </Typography>
                }
              >
                <TextField
                  margin="dense"
                  style={{ width: 125 }}
                  label="Starting Exon"
                  value={startingExon}
                  onChange={(event) =>
                    setNumericField(
                      event.target.value,
                      setStartingExonText,
                      setStartingExon,
                      true
                    )
                  }
                  onKeyDown={handleEnterKey}
                  error={startingExonText !== ""}
                  helperText={startingExonText !== "" ? startingExonText : null}
                />
              </HelpTooltip>
              <HelpTooltip
                placement="bottom"
                title={
                  <Typography>
                    The ending exon number counted from the 5&#39; end of the
                    transcript.
                  </Typography>
                }
              >
                <TextField
                  margin="dense"
                  style={{ width: 125 }}
                  label="Ending Exon"
                  value={endingExon}
                  onChange={(event) =>
                    setNumericField(
                      event.target.value,
                      setEndingExonText,
                      setEndingExon,
                      true
                    )
                  }
                  onKeyDown={handleEnterKey}
                  error={endingExonText !== ""}
                  helperText={endingExonText !== "" ? endingExonText : null}
                />
              </HelpTooltip>
            </Box>
            {startingExon !== "" || endingExon !== "" ? (
              <Box className="bottom-inputs">
                <HelpTooltip
                  placement="bottom"
                  title={
                    <Typography>
                      A value representing the offset from the segment boundary,
                      with positive values offset towards the 5’ end of the
                      transcript and negative values offset towards the 3’ end
                      of the transcript. Optional.
                    </Typography>
                  }
                >
                  <TextField
                    margin="dense"
                    style={{ width: 125 }}
                    label="Starting Offset"
                    value={startingExonOffset}
                    onChange={(event) =>
                      setNumericField(
                        event.target.value,
                        setStartingExonOffsetText,
                        setStartingExonOffset,
                        true
                      )
                    }
                    onKeyDown={handleEnterKey}
                    error={startingExonOffsetText !== ""}
                    helperText={
                      startingExonOffsetText !== ""
                        ? startingExonOffsetText
                        : null
                    }
                  />
                </HelpTooltip>
                <HelpTooltip
                  placement="bottom"
                  title={
                    <Typography>
                      A value representing the offset from the segment boundary,
                      with positive values offset towards the 5’ end of the
                      transcript and negative values offset towards the 3’ end
                      of the transcript. Optional.
                    </Typography>
                  }
                >
                  <TextField
                    margin="dense"
                    style={{ width: 125 }}
                    label="Ending Offset"
                    value={endingExonOffset}
                    onChange={(event) =>
                      setNumericField(
                        event.target.value,
                        setEndingExonOffsetText,
                        setEndingExonOffset,
                        true
                      )
                    }
                    onKeyDown={handleEnterKey}
                    error={endingExonOffsetText !== ""}
                    helperText={
                      endingExonOffsetText !== "" ? endingExonOffsetText : null
                    }
                  />
                </HelpTooltip>
              </Box>
            ) : null}
          </Box>
        );
    }
  };

  /**
   * Wrapper around input type selection to ensure unused inputs/warnings get cleared
   * @param selection selection from input type dropdown menu
   */
  const selectInputType = (selection: InputType) => {
    if (txInputType !== "default") {
      if (selection === "exon_coords") {
        clearGenomicCoordWarnings();
      } else {
        clearExonWarnings();
      }
    }
    setTxInputType(selection);
  };

  const inputElements = (
    <>
      <Box className="top-inputs">
        <HelpTooltip
          placement="left"
          title={
            <>
              <Typography>
                Select the types of location data to provide for constructing
                this transcript segment.
              </Typography>
              <Typography>
                Regardless of what kinds of data you provide, we can generate
                exhaustive genomic and transcript-level location information for
                this element.
              </Typography>
            </>
          }
        >
          <FormControl variant="standard">
            <InputLabel id="select-input-data"></InputLabel>
            <Select
              labelId="select-input-data"
              value={txInputType}
              onChange={(event) =>
                selectInputType(event.target.value as InputType)
              }
            >
              <MenuItem value="default" disabled>
                Select input data
              </MenuItem>
              <MenuItem value="genomic_coords">Genomic coordinates</MenuItem>
              <MenuItem value="exon_coords">
                Exon coordinates, transcript
              </MenuItem>
            </Select>
          </FormControl>
        </HelpTooltip>
      </Box>
      {renderTxOptions()}
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
    pendingResponse,
  });
};

export default TxSegmentCompInput;
