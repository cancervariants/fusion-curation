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
  CircularProgress,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { GeneAutocomplete } from "../../main/shared/GeneAutocomplete/GeneAutocomplete";
import { getGenomicCoords, getExonCoords } from "../../../services/main";
import {
  CoordsUtilsResponse,
  GenomicData,
} from "../../../services/ResponseModels";
import StrandSwitch from "../../main/shared/StrandSwitch/StrandSwitch";
import TabHeader from "../../main/shared/TabHeader/TabHeader";
import TabPaper from "../../main/shared/TabPaper/TabPaper";
import { HelpPopover } from "../../main/shared/HelpPopover/HelpPopover";
import ChromosomeField from "../../main/shared/ChromosomeField/ChromosomeField";
import TranscriptField from "../../main/shared/TranscriptField/TranscriptField";

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
    strandSwitchLabel: {
      marginLeft: "0 !important",
    },
    coordsCard: {
      margin: "10px",
    },
  }));
  const classes = useStyles();
  const [inputType, setInputType] = useState<string>("default");

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

  const [results, setResults] = useState<GenomicData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseWarnings, setResponseWarnings] = useState<string[]>([]);

  // programming horror
  const inputComplete =
    (inputType === "genomic_coords" &&
      gene !== "" &&
      chromosome !== "" &&
      (start !== "" || end !== "")) ||
    (inputType === "exon_coords_tx" &&
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
          setResponseWarnings(
            ["Unable to resolve coordinates lookup given provided parameters. Double check that the coordinates entered are valid for the selected Transcript."]
          );
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
      setResults(coordsResponse.coordinates_data as GenomicData);
    }
    setIsLoading(false);
  };

  const handleTranscriptSelect = (event: any) => {
    setSelectedTranscript(event.target.value as string);
    setTxAc(event.target.value as string);
  };

  const fetchResults = () => {
    setIsLoading(true);
    if (inputType == "exon_coords_tx") {
      getGenomicCoords(
        gene,
        txAc,
        exonStart,
        exonEnd,
        exonStartOffset,
        exonEndOffset
      ).then((coordsResponse) => handleResponse(coordsResponse));
    } else if (inputType == "genomic_coords") {
      getExonCoords(chromosome, start, end, strand, gene, txAc).then(
        (coordsResponse) => handleResponse(coordsResponse)
      );
    }
  };

  const renderRow = (title: string, value: string | number) => (
    <TableRow>
      <TableCell align="left">
        <b>{title}</b>
      </TableCell>
      <TableCell align="left">{value}</TableCell>
    </TableRow>
  );

  const renderResults = (): React.ReactFragment => {
    if (isLoading) {
      return (
        <Box alignContent="center" alignItems="center" justifyContent="center" display="flex" flexDirection="column">
          <Box mb={2}>Retrieving results...</Box>
          <CircularProgress />
        </Box>
      )
    }
    if (inputValid) {
      if (results) {
        return (
          <Table>
            {renderRow("Gene", results.gene)}
            {renderRow("Chromosome", results.chr)}
            {results.start ? renderRow("Genomic start", results.start) : null}
            {results.end ? renderRow("Genomic end", results.end) : null}
            {results.strand
              ? renderRow("Strand", results.strand === 1 ? "+" : "-")
              : null}
            {renderRow("Transcript", results.transcript)}
            {results.exon_start
              ? renderRow("Exon start", results.exon_start)
              : null}
            {results.exon_start_offset
              ? renderRow("Exon start offset", results.exon_start_offset)
              : null}
            {results.exon_end ? renderRow("Exon end", results.exon_end) : null}
            {results.exon_end_offset
              ? renderRow("Exon end offset", results.exon_end_offset)
              : null}
          </Table>
        );
      } else if (responseWarnings?.length > 0) {
        return <Typography>{responseWarnings}</Typography>;
      } else {
        return <Typography>
          An unknown error has occurred. Please{" "}
          <Link href="https://github.com/cancervariants/fusion-curation/issues">
            submit an issue on our GitHub
          </Link>{" "}
          and include replication steps, along with the values entered.
        </Typography>
      }
    } else {
      return <></>;
    }
  };

  const genomicCoordinateInfo = (
    <>
      <Box display="flex" justifyContent="space-between" width="100%">
        <ChromosomeField
          fieldValue={chromosome}
        />
        <Box mt="18px">
          <Box className={classes.strand}>
            <StrandSwitch
              setStrand={setStrand}
              selectedStrand={strand}
              switchClasses={{
                labelPlacementStart: classes.strandSwitchLabel,
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );

  const renderInputOptions = () => {
    switch (inputType) {
      case "genomic_coords":
        return (
          <>
            <Box className={classes.fieldsPair}>
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
                style={{minWidth: "150px"}}
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
            <Box className={classes.fieldsPair}>
              <TextField
                type='number'
                margin="dense"
                label="Genomic Start"
                value={start}
                onChange={(event) => setStart(event.target.value)}
                helperText={start ? startText : ""}
              />
              <TextField
                type='number'
                margin="dense"
                label="Genomic End"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
              />
            </Box>
          </>
        );
      case "exon_coords_tx":
        return (
          <>
            <Box>
              <TranscriptField
                fieldValue={txAc}
                valueSetter={setTxAc}
                errorText={txAcText}
              />
            </Box>
            <Box className={classes.fieldsPair}>
              <TextField
                type='number'
                margin="dense"
                style={{ minWidth: 125 }}
                label="Starting Exon"
                value={exonStart}
                onChange={(event) => setExonStart(event.target.value)}
                error={exonStart === "" && (exonStartText !== "")}
                helperText={exonStart ? exonStartText : ""}
              />
              <TextField
                type='number'
                margin="dense"
                style={{ minWidth: 125 }}
                label="Starting Offset"
                value={exonStartOffset}
                onChange={(event) => setExonStartOffset(event.target.value)}
              />
            </Box>
            <Box className={classes.fieldsPair}>
              <TextField
                type='number'
                margin="dense"
                style={{ minWidth: 125 }}
                label="Ending Exon"
                value={exonEnd}
                onChange={(event) => setExonEnd(event.target.value)}
                error={exonEnd !== "" && exonEndText !== ""}
                helperText={exonEnd ? exonEndText : ""}
              />
              <TextField
                type='number'
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
            onChange={(event) => setInputType(event.target.value as string)}
          >
            <MenuItem value="default" disabled>
              Select input data
            </MenuItem>
            <MenuItem value="genomic_coords">
              Genomic coordinates
            </MenuItem>
            <MenuItem value="exon_coords_tx">
              Exon coordinates
            </MenuItem>
          </Select>
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
