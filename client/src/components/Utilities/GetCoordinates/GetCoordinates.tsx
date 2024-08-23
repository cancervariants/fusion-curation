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
} from "@material-ui/core";
import React, { ChangeEvent, useEffect, useState } from "react";
import { GeneAutocomplete } from "../../main/shared/GeneAutocomplete/GeneAutocomplete";
import {
  getGenomicCoords,
  getExonCoords,
  TxElementInputType,
} from "../../../services/main";
import {
  CoordsUtilsResponse,
  GenomicTxSegService,
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
      width: "70%",
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
  const [inputType, setInputType] = useState<TxElementInputType>(
    TxElementInputType.default
  );

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

  const [results, setResults] = useState<GenomicTxSegService | null>(null);
  const [error, setError] = useState<string>("");

  // programming horror
  const inputComplete =
    (inputType === "genomic_coords_gene" &&
      gene !== "" &&
      chromosome !== "" &&
      (start !== "" || end !== "")) ||
    (inputType === "genomic_coords_tx" &&
      txAc !== "" &&
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
    setChromosomeText("");
    setStartText("");
    setEndText("");
    setExonStartText("");
    setExonEndText("");
  };

  const handleResponse = (coordsResponse: CoordsUtilsResponse) => {
    if (coordsResponse.warnings) {
      setResults(null);
      clearWarnings();
      coordsResponse.warnings.forEach((warning) => {
        if (warning.startsWith("Found more than one accession")) {
          setChromosomeText("Complete ID required");
        } else if (warning.startsWith("Unable to get exons for")) {
          setTxAcText("Unrecognized transcript");
        } else if (warning.startsWith("Invalid chromosome")) {
          setChromosomeText("Unrecognized value");
        } else if (
          warning == "Must find exactly one row for genomic data, but found: 0"
        ) {
          setError(
            "Unable to resolve coordinates lookup given provided parameters"
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
      setResults(coordsResponse.coordinates_data as GenomicTxSegService);
    }
  };

  const fetchResults = () => {
    if (inputType == "exon_coords_tx") {
      getGenomicCoords(
        gene,
        txAc,
        exonStart,
        exonEnd,
        exonStartOffset,
        exonEndOffset
      ).then((coordsResponse) => handleResponse(coordsResponse));
    } else if (inputType == "genomic_coords_gene") {
      getExonCoords(chromosome, start, end, gene).then((coordsResponse) =>
        handleResponse(coordsResponse)
      );
    } else if (inputType == "genomic_coords_tx") {
      getExonCoords(chromosome, start, end, "", txAc).then((coordsResponse) =>
        handleResponse(coordsResponse)
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
            {results.strand
              ? renderRow("Strand", results.strand === 1 ? "+" : "-")
              : null}
            {renderRow("Transcript", results.tx_ac)}
            {txSegStart?.exon_ord != null
              ? renderRow("Exon start", txSegStart.exon_ord)
              : null}
            {txSegStart?.offset != null
              ? renderRow("Exon start offset", txSegStart.offset)
              : null}
            {txSegEnd?.exon_ord != null
              ? renderRow("Exon end", txSegEnd.exon_ord)
              : null}
            {txSegEnd?.offset != null
              ? renderRow("Exon end offset", txSegEnd.offset)
              : null}
          </Table>
        );
      } else if (error) {
        return <Typography>{error}</Typography>;
      } else {
        return <></>;
      }
    } else {
      return <></>; // TODO error message
    }
  };

  const handleChromosomeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChromosome(e.target.value);
  };

  const genomicCoordinateInfo = (
    <>
      <Box display="flex" justifyContent="space-between" width="100%">
        <ChromosomeField
          fieldValue={chromosome}
          errorText={chromosomeText}
          onChange={handleChromosomeChange}
        />
        <Box mt="18px">
          <Box className={classes.strand} width="125px">
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
      case "genomic_coords_gene":
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
              />
            </Box>
            {genomicCoordinateInfo}
            <Box className={classes.fieldsPair}>
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Starting Position"
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Ending Position"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
              />
            </Box>
          </>
        );
      case "genomic_coords_tx":
        return (
          <>
            <Box className={classes.fieldsPair}>
              <TranscriptField
                fieldValue={txAc}
                valueSetter={setTxAc}
                errorText={txAcText}
              />
            </Box>
            {genomicCoordinateInfo}
            <Box className={classes.fieldsPair}>
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Starting Position"
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Ending Position"
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
                margin="dense"
                style={{ width: 125 }}
                label="Starting Exon"
                value={exonStart}
                onChange={(event) => setExonStart(event.target.value)}
                error={exonStart && exonStartText !== ""}
                helperText={exonStart ? exonStartText : ""}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Starting Offset"
                value={exonStartOffset}
                onChange={(event) => setExonStartOffset(event.target.value)}
              />
            </Box>
            <Box className={classes.fieldsPair}>
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Ending Exon"
                value={exonEnd}
                onChange={(event) => setExonEnd(event.target.value)}
                error={exonEnd && exonEndText !== ""}
                helperText={exonEnd ? exonEndText : ""}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
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
            <MenuItem value={TxElementInputType.default} disabled>
              Select input data
            </MenuItem>
            <MenuItem value={TxElementInputType.gcg}>
              Genomic coordinates, gene
            </MenuItem>
            <MenuItem value={TxElementInputType.gct}>
              Genomic coordinates, transcript
            </MenuItem>
            <MenuItem value={TxElementInputType.ect}>
              Exon coordinates, transcript
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
