import {
  Select,
  MenuItem,
  TextField,
  Table,
  TableRow,
  TableCell,
  Typography,
  makeStyles,
  Box,
  Link,
  InputLabel,
  FormControl,
} from "@material-ui/core";
import React, { ChangeEvent, useEffect, useState } from "react";
import { GeneAutocomplete } from "../../main/shared/GeneAutocomplete/GeneAutocomplete";
import {
  getGenomicCoords,
  getExonCoords,
  TxElementInputType,
  GenomicInputType,
} from "../../../services/main";
import {
  CoordsUtilsResponse,
  GenomicTxSegService,
} from "../../../services/ResponseModels";
import TabHeader from "../../main/shared/TabHeader/TabHeader";
import TabPaper from "../../main/shared/TabPaper/TabPaper";
import { HelpPopover } from "../../main/shared/HelpPopover/HelpPopover";
import ChromosomeField from "../../main/shared/ChromosomeField/ChromosomeField";
import TranscriptField from "../../main/shared/TranscriptField/TranscriptField";
import LoadingMessage from "../../main/shared/LoadingMessage/LoadingMessage";
import HelpTooltip from "../../main/shared/HelpTooltip/HelpTooltip";

const GetCoordinates: React.FC = () => {
  const useStyles = makeStyles(() => ({
    pageContainer: {
      paddingBottom: "32px",
    },
    inputContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    inputSelector: {
      width: "100%",
      minHeight: "50px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-around",
    },
    inputParams: {
      display: "flex",
      width: "100%",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
    },
    fieldsPair: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    strand: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    coordsCard: {
      margin: "10px",
    },
  }));
  const classes = useStyles();
  const [inputType, setInputType] = useState<TxElementInputType>(
    TxElementInputType.default
  );
  const [genomicInputType, setGenomicInputType] =
    useState<GenomicInputType | null>(null);

  const [txAc, setTxAc] = useState<string>("");
  const [txAcText, setTxAcText] = useState("");

  const [gene, setGene] = useState<string>("");
  const [geneText, setGeneText] = useState<string>("");

  const [strand, setStrand] = useState<string>("+");

  const [chromosome, setChromosome] = useState<string>("");
  const [chromosomeText, setChromosomeText] = useState<string>("");

  const [start, setStart] = useState<string>("");
  const [startText, setStartText] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [endText, setEndText] = useState<string>("");

  const [exonStart, setExonStart] = useState<string>("");
  const [exonStartText, setExonStartText] = useState<string>("");
  const [exonEnd, setExonEnd] = useState<string>("");
  const [exonEndText, setExonEndText] = useState<string>("");
  const [exonStartOffset, setExonStartOffset] = useState<string>("");
  const [exonEndOffset, setExonEndOffset] = useState<string>("");

  const [geneTranscripts, setGeneTranscripts] = useState([]);
  const [selectedTranscript, setSelectedTranscript] = useState("");

  const [results, setResults] = useState<GenomicTxSegService | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseWarnings, setResponseWarnings] = useState<string[]>([]);

  const genomicInputComplete =
    genomicInputType === GenomicInputType.GENE
      ? gene !== "" && selectedTranscript !== ""
      : txAc !== "";

  // programming horror
  const inputComplete =
    (inputType === TxElementInputType.gc &&
      genomicInputComplete &&
      chromosome !== "" &&
      (start !== "" || end !== "")) ||
    (inputType === TxElementInputType.ec &&
      txAc !== "" &&
      (exonStart !== "" || exonEnd !== ""));

  const inputValid =
    inputComplete &&
    !txAcText &&
    !geneText &&
    !chromosomeText &&
    !startText &&
    !endText &&
    !exonStartText &&
    !exonEndText;

  useEffect(() => {
    if (inputComplete) {
      fetchResults();
    }
  }, [
    txAc,
    gene,
    strand,
    chromosome,
    start,
    end,
    exonStart,
    exonEnd,
    exonStartOffset,
    exonEndOffset,
  ]);

  const clearWarnings = () => {
    setTxAcText("");
    setGeneText("");
    setStartText("");
    setEndText("");
    setExonStartText("");
    setExonEndText("");
    setResponseWarnings([]);
  };

  const handleResponse = (coordsResponse: CoordsUtilsResponse) => {
    if (coordsResponse.warnings) {
      setResponseWarnings(coordsResponse.warnings);
      setResults(null);
      coordsResponse.warnings.forEach((warning) => {
        if (warning.startsWith("Found more than one accession")) {
          setChromosomeText("Complete ID required");
        } else if (warning.startsWith("Unable to get exons for")) {
          setTxAcText("Unrecognized transcript");
        } else if (
          warning == "Must find exactly one row for genomic data, but found: 0"
        ) {
          setResponseWarnings([
            "Unable to resolve coordinates lookup given provided parameters. Double check that the coordinates entered are valid for the selected transcript.",
          ]);
        } else if (warning.startsWith("Exon ")) {
          const exonPattern = /Exon (\d*) does not exist on (.*)/;
          const match = exonPattern.exec(warning);
          if (match) {
            if (exonStart === match[1]) {
              setExonStartText("Out of range");
            } else if (exonEnd === match[1]) {
              setExonEndText("Out of range");
            }
          }
        }
      });
    } else {
      clearWarnings();
      setResults(coordsResponse.coordinates_data as GenomicTxSegService);
    }
    setIsLoading(false);
  };

  const handleTranscriptSelect = (event: any) => {
    setSelectedTranscript(event.target.value as string);
    setTxAc(event.target.value as string);
  };

  const fetchResults = () => {
    setIsLoading(true);
    if (inputType == "exon_coords") {
      getGenomicCoords(
        gene,
        txAc,
        exonStart,
        exonEnd,
        exonStartOffset,
        exonEndOffset
      ).then((coordsResponse) => handleResponse(coordsResponse));
    } else if (inputType == "genomic_coords") {
      getExonCoords(chromosome, start, end, gene, txAc).then((coordsResponse) =>
        handleResponse(coordsResponse)
      );
    }
  };

  const renderRow = (
    title: string,
    value: string | number | null | undefined
  ) => (
    <TableRow>
      <TableCell align="left">
        <b>{title}</b>
      </TableCell>
      <TableCell align="left">{value}</TableCell>
    </TableRow>
  );

  const renderResults = (): React.ReactFragment => {
    if (isLoading) {
      return <LoadingMessage message="Fetching coordinates..." />;
    }
    if (inputValid) {
      if (results) {
        const txSegStart = results.seg_start;
        const txSegEnd = results.seg_end;

        const genomicStart =
          txSegStart?.genomic_location.start ||
          txSegStart?.genomic_location.end;
        const genomicEnd =
          txSegEnd?.genomic_location.start || txSegEnd?.genomic_location.end;

        return (
          <Table>
            {renderRow("Gene", results.gene)}
            {renderRow("Chromosome", results.genomic_ac)}
            {genomicStart != null
              ? renderRow("Genomic start", genomicStart)
              : null}
            {genomicEnd != null ? renderRow("Genomic end", genomicEnd) : null}
            {renderRow("Transcript", results.tx_ac)}
            {txSegStart?.exon_ord != null
              ? renderRow("Exon start", txSegStart.exon_ord + 1)
              : null}
            {txSegStart?.offset != null
              ? renderRow("Exon start offset", txSegStart.offset)
              : null}
            {txSegEnd?.exon_ord != null
              ? renderRow("Exon end", txSegEnd.exon_ord + 1)
              : null}
            {txSegEnd?.offset != null
              ? renderRow("Exon end offset", txSegEnd.offset)
              : null}
          </Table>
        );
      } else if (responseWarnings?.length > 0) {
        return <Typography>{responseWarnings}</Typography>;
      } else {
        return (
          <Typography>
            An unknown error has occurred. Please{" "}
            <Link href="https://github.com/cancervariants/fusion-curation/issues/new?assignees=&labels=bug&projects=&template=bug-report.yaml">
              submit an issue on our GitHub
            </Link>{" "}
            and include replication steps, along with the values entered.
          </Typography>
        );
      }
    } else {
      return <></>;
    }
  };

  const txInputField = (
    <TranscriptField
      fieldValue={txAc}
      valueSetter={setTxAc}
      errorText={txAcText}
    />
  );

  const handleChromosomeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChromosome(e.target.value);
  };

  const genomicCoordinateInfo = (
    <>
      <Box display="flex" justifyContent="space-between" width="100%">
        <ChromosomeField
          fieldValue={chromosome}
          onChange={handleChromosomeChange}
        />
      </Box>
    </>
  );

  const renderInputOptions = () => {
    switch (inputType) {
      case TxElementInputType.gc:
        if (!genomicInputType) {
          return <></>;
        }
        return (
          <>
            <Box className={classes.fieldsPair}>
              {genomicInputType === GenomicInputType.GENE ? (
                <>
                  <GeneAutocomplete
                    gene={gene}
                    setGene={setGene}
                    geneText={geneText}
                    setGeneText={setGeneText}
                    setChromosome={setChromosome}
                    setStrand={setStrand}
                    setTranscripts={setGeneTranscripts}
                    setDefaultTranscript={setSelectedTranscript}
                  />
                  <FormControl>
                    <InputLabel>Transcript</InputLabel>
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
                </>
              ) : (
                <>
                  <Box>{txInputField}</Box>
                </>
              )}
            </Box>
            {genomicCoordinateInfo}
            <Box className={classes.fieldsPair}>
              <HelpTooltip
                placement="bottom"
                title={
                  <Typography>
                    The starting genomic position (inter-residue) of the
                    transcript segment.
                  </Typography>
                }
              >
                <TextField
                  margin="dense"
                  label="Genomic Start"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  helperText={start ? startText : ""}
                />
              </HelpTooltip>
              <HelpTooltip
                placement="bottom"
                title={
                  <Typography>
                    The ending genomic position (inter-residue) of the
                    transcript segment.
                  </Typography>
                }
              >
                <TextField
                  margin="dense"
                  label="Genomic End"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                />
              </HelpTooltip>
            </Box>
          </>
        );
      case TxElementInputType.ec:
        return (
          <>
            <Box>{txInputField}</Box>
            <Box className={classes.fieldsPair}>
              <TextField
                margin="dense"
                style={{ minWidth: 200 }}
                label="Starting Exon (1-indexed)"
                value={exonStart}
                onChange={(event) => setExonStart(event.target.value)}
                error={exonStart === "" && exonStartText !== ""}
                helperText={exonStart ? exonStartText : ""}
              />
              <TextField
                margin="dense"
                style={{ minWidth: 125 }}
                label="Starting Offset"
                value={exonStartOffset}
                onChange={(event) => setExonStartOffset(event.target.value)}
              />
            </Box>
            <Box className={classes.fieldsPair}>
              <TextField
                margin="dense"
                style={{ minWidth: 200 }}
                label="Ending Exon (1-indexed)"
                value={exonEnd}
                onChange={(event) => setExonEnd(event.target.value)}
                error={exonEnd !== "" && exonEndText !== ""}
                helperText={exonEnd ? exonEndText : ""}
              />
              <TextField
                margin="dense"
                style={{ minWidth: 125 }}
                label="Ending Offset"
                value={exonEndOffset}
                onChange={(event) => setExonEndOffset(event.target.value)}
              />
            </Box>
          </>
        );
    }
  };

  const inputField = (
    <Box className={classes.inputContainer}>
      <Box className={classes.inputSelector}>
        <Box>
          <Select
            value={inputType}
            onChange={(event) =>
              setInputType(event.target.value as TxElementInputType)
            }
          >
            <MenuItem value={TxElementInputType.default} disabled>
              Select input data
            </MenuItem>
            <MenuItem value="genomic_coords">Genomic coordinates</MenuItem>
            <MenuItem value="exon_coords">Exon coordinates</MenuItem>
          </Select>
          {inputType === TxElementInputType.gc ? (
            <FormControl fullWidth style={{ marginTop: "10px" }}>
              <InputLabel id="genomic-input-type">
                Gene or Transcript?
              </InputLabel>
              <Select
                labelId="genomic-input-type"
                value={genomicInputType}
                onChange={(event) =>
                  setGenomicInputType(event.target.value as GenomicInputType)
                }
              >
                <MenuItem value="gene">Gene</MenuItem>
                <MenuItem value="transcript">Transcript</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <></>
          )}
        </Box>
      </Box>
      <Box className={classes.inputParams}>{renderInputOptions()}</Box>
    </Box>
  );

  return (
    <Box className={classes.pageContainer}>
      <TabHeader
        title="Convert Coordinates"
        subHeader={
          <>
            Liftover between genomic and exon coordinates
            <HelpPopover>
              <Typography>
                The{" "}
                <Link href="https://github.com/biocommons/uta">
                  Biocommons Universal Transcript Archive
                </Link>{" "}
                provides mappings between genomic and transcript coordinates for
                reference sequences and RefSeq transcripts. This tool provides a
                basic frontend to UTA, enabling simple conversion between types
                of coordinates.
              </Typography>
            </HelpPopover>
          </>
        }
      />
      <TabPaper leftColumn={inputField} rightColumn={renderResults()} />
    </Box>
  );
};

export default GetCoordinates;
