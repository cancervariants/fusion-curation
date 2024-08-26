import {
  TextField,
  MenuItem,
  Select,
  Box,
  Typography,
} from "@material-ui/core";
import {
  ClientTranscriptSegmentElement,
  TranscriptSegmentElement,
  TxSegmentElementResponse,
} from "../../../../../services/ResponseModels";
import React, {
  useEffect,
  useState,
  KeyboardEvent,
  useContext,
  ChangeEvent,
} from "react";
import {
  getTxSegmentElementECT,
  getTxSegmentElementGCG,
  getTxSegmentElementGCT,
  getTxSegmentNomenclature,
  TxElementInputType,
} from "../../../../../services/main";
import { GeneAutocomplete } from "../../../../main/shared/GeneAutocomplete/GeneAutocomplete";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";
import { FusionContext } from "../../../../../global/contexts/FusionContext";
import StrandSwitch from "../../../../main/shared/StrandSwitch/StrandSwitch";
import HelpTooltip from "../../../../main/shared/HelpTooltip/HelpTooltip";
import ChromosomeField from "../../../../main/shared/ChromosomeField/ChromosomeField";
import TranscriptField from "../../../../main/shared/TranscriptField/TranscriptField";

interface TxSegmentElementInputProps extends StructuralElementInputProps {
  element: ClientTranscriptSegmentElement;
}

const TxSegmentCompInput: React.FC<TxSegmentElementInputProps> = ({
  element,
  index,
  handleSave,
  handleDelete,
  icon,
}) => {
  const { fusion } = useContext(FusionContext);

  const [txInputType, setTxInputType] = useState<TxElementInputType>(
    (element.inputType as TxElementInputType) || TxElementInputType.default
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
  const [txChromText, setTxChromText] = useState("");

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

  const [pendingResponse, setPendingResponse] = useState(false);

  const hasRequiredEnds =
    txEndingGenomic || endingExon || txStartingGenomic || startingExon;

  // programming horror
  const inputComplete =
    (txInputType === TxElementInputType.gcg &&
      txGene !== "" &&
      txChrom !== "" &&
      (txStartingGenomic !== "" || txEndingGenomic !== "")) ||
    (txInputType === TxElementInputType.gct &&
      txAc !== "" &&
      txChrom !== "" &&
      (txStartingGenomic !== "" || txEndingGenomic !== "")) ||
    (txInputType === TxElementInputType.ect &&
      txAc !== "" &&
      (startingExon !== "" || endingExon !== ""));

  const validated: boolean =
    inputComplete &&
    hasRequiredEnds &&
    txGeneText === "" &&
    txChromText === "" &&
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

  /**
   * Check for, and handle, warning about invalid chromosome input
   * @param responseWarnings warnings property of transcript segment response object
   */
  const checkChromosomeWarning = (responseWarnings: string[]) => {
    const chromWarning = `Invalid chromosome: ${txChrom}`;
    if (responseWarnings.includes(chromWarning)) {
      setTxChromText("Unrecognized value");
    }
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
  };

  /**
   * Reset warnings related to genomic coordinate values
   */
  const clearGenomicCoordWarnings = () => {
    setTxChromText("");
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

  /**
   * Request construction of tx segment element from server and handle response
   */
  const buildTranscriptSegmentElement = () => {
    setPendingResponse(true);
    // fire constructor request
    switch (txInputType) {
      case TxElementInputType.gcg:
        clearGenomicCoordWarnings();
        getTxSegmentElementGCG(
          txGene,
          txChrom,
          txStartingGenomic,
          txEndingGenomic,
          txStrand
        ).then((txSegmentResponse) => {
          if (
            txSegmentResponse.warnings &&
            txSegmentResponse.warnings?.length > 0
          ) {
            checkChromosomeWarning(txSegmentResponse.warnings);
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
      case TxElementInputType.gct:
        clearGenomicCoordWarnings();
        getTxSegmentElementGCT(
          txAc,
          txChrom,
          txStartingGenomic,
          txEndingGenomic
        ).then((txSegmentResponse) => {
          if (
            txSegmentResponse.warnings &&
            txSegmentResponse.warnings?.length > 0
          ) {
            // TODO more warnings
            checkChromosomeWarning(txSegmentResponse.warnings);
            CheckGenomicCoordWarning(txSegmentResponse.warnings);
          } else {
            const inputParams = {
              inputType: txInputType,
              inputTx: txAc,
              inputStrand: txStrand,
              inputChr: txChrom,
              inputGenomicStart: txStartingGenomic,
              inputGenomicEnd: txEndingGenomic,
            };
            handleTxElementResponse(txSegmentResponse, inputParams);
          }
        });
        break;
      case TxElementInputType.ect:
        getTxSegmentElementECT(
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

  const handleChromosomeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTxChrom(e.target.value);
  };

  const genomicCoordinateInfo = (
    <>
      <Box className="mid-inputs">
        <ChromosomeField
          fieldValue={txChrom}
          errorText={txChromText}
          onChange={handleChromosomeChange}
        />
        <Box mt="18px" width="125px">
          <StrandSwitch selectedStrand={txStrand} />
        </Box>
      </Box>
      <Box className="bottom-inputs">{renderTxGenomicCoords()}</Box>
    </>
  );

  const renderTxOptions = () => {
    switch (txInputType) {
      case TxElementInputType.gcg:
        return (
          <Box>
            <Box className="mid-inputs" minWidth="255px">
              <GeneAutocomplete
                gene={txGene}
                setGene={setTxGene}
                tooltipDirection="bottom"
                geneText={txGeneText}
                setGeneText={setTxGeneText}
                setChromosome={setTxChrom}
                setStrand={setTxStrand}
              />
            </Box>
            {genomicCoordinateInfo}
          </Box>
        );
      case TxElementInputType.gct:
        return (
          <Box>
            {txInputField}
            {genomicCoordinateInfo}
          </Box>
        );
      case TxElementInputType.ect:
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
  const selectInputType = (selection: TxElementInputType) => {
    if (txInputType !== "default") {
      if (selection === "exon_coords_tx") {
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
          <Select
            value={txInputType}
            onChange={(event) =>
              selectInputType(event.target.value as TxElementInputType)
            }
          >
            <MenuItem value="default" disabled>
              Select input data
            </MenuItem>
            <MenuItem value="genomic_coords_gene">
              Genomic coordinates, gene
            </MenuItem>
            <MenuItem value="genomic_coords_tx">
              Genomic coordinates, transcript
            </MenuItem>
            <MenuItem value="exon_coords_tx">
              Exon coordinates, transcript
            </MenuItem>
          </Select>
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
