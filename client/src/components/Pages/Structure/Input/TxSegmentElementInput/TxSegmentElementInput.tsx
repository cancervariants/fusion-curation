import {
  TextField,
  MenuItem,
  FormLabel,
  Select,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import {
  ClientTranscriptSegmentElement,
  TranscriptSegmentElement,
  TxSegmentElementResponse,
} from "../../../../../services/ResponseModels";
import React, { useEffect, useState, KeyboardEvent, useContext } from "react";
import {
  getTxSegmentElementECT,
  getTxSegmentElementGCG,
  getTxSegmentElementGCT,
  getTxSegmentNomenclature,
} from "../../../../../services/main";
import { GeneAutocomplete } from "../../../../main/shared/GeneAutocomplete/GeneAutocomplete";
import { StructuralElementInputProps } from "../StructuralElementInputProps";
import CompInputAccordion from "../StructuralElementInputAccordion";
import { FusionContext } from "../../../../../global/contexts/FusionContext";

interface TxSegmentElementInputProps extends StructuralElementInputProps {
  element: ClientTranscriptSegmentElement;
}

export enum InputType {
  default = "default",
  gcg = "genomic_coords_gene",
  gct = "genomic_coords_tx",
  ect = "exon_coords_tx",
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
    (element.input_type as InputType) || InputType.default
  );

  // "Text" variables refer to helper or warning text to set under input fields
  const [txAc, setTxAc] = useState(element.input_tx || "");
  const [txAcText, setTxAcText] = useState("");

  const [txGene, setTxGene] = useState(element.input_gene || "");
  const [txGeneText, setTxGeneText] = useState("");

  const [txStrand, setTxStrand] = useState(element.input_strand || "default");

  const [txChrom, setTxChrom] = useState(element.input_chr || "");
  const [txChromText, setTxChromText] = useState("");

  const [txStartingGenomic, setTxStartingGenomic] = useState(
    element.input_genomic_start || ""
  );
  const [txStartingGenomicText, setTxStartingGenomicText] = useState("");
  const [txEndingGenomic, setTxEndingGenomic] = useState(
    element.input_genomic_end || ""
  );
  const [txEndingGenomicText, setTxEndingGenomicText] = useState("");

  const [startingExon, setStartingExon] = useState(element.exon_start || "");
  const [startingExonText, setStartingExonText] = useState("");
  const [endingExon, setEndingExon] = useState(element.exon_end || "");
  const [endingExonText, setEndingExonText] = useState("");
  const [startingExonOffset, setStartingExonOffset] = useState(
    element.exon_start_offset || ""
  );
  const [startingExonOffsetText, setStartingExonOffsetText] = useState("");
  const [endingExonOffset, setEndingExonOffset] = useState(
    element.exon_end_offset || ""
  );
  const [endingExonOffsetText, setEndingExonOffsetText] = useState("");

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
    (txInputType === InputType.gcg &&
      txGene !== "" &&
      txChrom !== "" &&
      txStrand !== "default" &&
      (txStartingGenomic !== "" || txEndingGenomic !== "")) ||
    (txInputType === InputType.gct &&
      txAc !== "" &&
      txChrom !== "" &&
      txStrand !== "default" &&
      (txStartingGenomic !== "" || txEndingGenomic !== "")) ||
    (txInputType === InputType.ect &&
      txAc !== "" &&
      (startingExon !== "" || endingExon !== ""));

  const validated =
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
      // console.log(index);
      // console.log(fusion.structural_elements.length);
      getTxSegmentNomenclature(
        responseElement,
        index === 0,
        index !== 0 && index >= fusion.structural_elements.length - 1
      ).then((nomenclatureResponse) => {
        if (
          !nomenclatureResponse.warnings &&
          nomenclatureResponse.nomenclature
        ) {
          finishedElement.nomenclature = nomenclatureResponse.nomenclature;
          handleSave(index, finishedElement);
        }
      });
    }
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
    // fire constructor request
    switch (txInputType) {
      case InputType.gcg:
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
              input_type: txInputType,
              input_strand: txStrand,
              input_gene: txGene,
              input_chr: txChrom,
              input_genomic_start: txStartingGenomic,
              input_genomic_end: txEndingGenomic,
            };
            handleTxElementResponse(txSegmentResponse, inputParams);
          }
        });
        break;
      case InputType.gct:
        clearGenomicCoordWarnings();
        getTxSegmentElementGCT(
          txAc,
          txChrom,
          txStartingGenomic,
          txEndingGenomic,
          txStrand
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
              input_type: txInputType,
              input_tx: txAc,
              input_strand: txStrand,
              input_chr: txChrom,
              input_genomic_start: txStartingGenomic,
              input_genomic_end: txEndingGenomic,
            };
            handleTxElementResponse(txSegmentResponse, inputParams);
          }
        });
        break;
      case InputType.ect:
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
            const txWarning = `Unable to get exons for ${txAc}`;
            if (txSegmentResponse.warnings.includes(txWarning)) {
              setTxAcText("Unrecognized value");
            }
          } else {
            const inputParams = {
              input_type: txInputType,
              input_tx: txAc,
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
   * Render transcript segment chromosome input field
   * @returns chromosome input TextField
   */
  const renderTxChrom = () => (
    <TextField
      margin="dense"
      style={{ height: 38, width: 125 }}
      value={txChrom}
      onChange={(event) => setTxChrom(event.target.value)}
      error={txChromText !== ""}
      onKeyDown={handleEnterKey}
      label="Chromosome"
      helperText={txChromText !== "" ? txChromText : null}
    />
  );

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
        helperText={txStartingGenomicText !== "" ? txStartingGenomicText : null}
      />
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
    </>
  );

  const renderTxOptions = () => {
    switch (txInputType) {
      case InputType.gcg:
        return (
          <div>
            <div className="mid-inputs">
              <GeneAutocomplete
                gene={txGene}
                setGene={setTxGene}
                geneText={txGeneText}
                setGeneText={setTxGeneText}
                style={{ width: 125 }}
              />
            </div>
            <div className="mid-inputs">
              {renderTxChrom()}
              <FormLabel component="legend">Strand</FormLabel>
              <RadioGroup
                aria-label="strand"
                name="strand"
                value={txStrand}
                onChange={(event) => setTxStrand(event.target.value as string)}
                row
              >
                <FormControlLabel value="+" control={<Radio />} label="+" />
                <FormControlLabel value="-" control={<Radio />} label="-" />
              </RadioGroup>
            </div>
            <div className="bottom-inputs">{renderTxGenomicCoords()}</div>
          </div>
        );
      case InputType.gct:
        return (
          <div>
            <div className="mid-inputs">
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Transcript"
                value={txAc}
                onChange={(event) => setTxAc(event.target.value)}
                onKeyDown={handleEnterKey}
                error={txAcText !== ""}
                helperText={txAcText}
              />
            </div>
            <div className="mid-inputs">
              {renderTxChrom()}
              <FormLabel component="legend">Strand</FormLabel>
              <RadioGroup
                aria-label="strand"
                name="strand"
                value={txStrand}
                onChange={(event) => setTxStrand(event.target.value as string)}
                row
              >
                <FormControlLabel value="+" control={<Radio />} label="+" />
                <FormControlLabel value="-" control={<Radio />} label="-" />
              </RadioGroup>
            </div>
            <div className="bottom-inputs">{renderTxGenomicCoords()}</div>
          </div>
        );
      case InputType.ect:
        return (
          <div>
            <div className="mid-inputs">
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Transcript"
                value={txAc}
                onChange={(event) => setTxAc(event.target.value)}
                onKeyDown={handleEnterKey}
                error={txAcText !== ""}
                helperText={txAcText}
              />
            </div>
            <div className="bottom-inputs">
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
            </div>
            {startingExon !== "" || endingExon !== "" ? (
              <div className="bottom-inputs">
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
              </div>
            ) : null}
          </div>
        );
    }
  };

  /**
   * Wrapper around input type selection to ensure unused inputs/warnings get cleared
   * @param selection selection from input type dropdown menu
   */
  const selectInputType = (selection: InputType) => {
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
      <div className="top-inputs">
        <Select
          value={txInputType}
          onChange={(event) => selectInputType(event.target.value as InputType)}
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
      </div>
      {renderTxOptions()}
    </>
  );

  return CompInputAccordion({
    expanded,
    setExpanded,
    element,
    handleDelete,
    inputElements,
    validated,
    icon,
  });
};

export default TxSegmentCompInput;
