import {
  Select,
  MenuItem,
  TextField,
  Table,
  TableRow,
  TableCell,
  Card,
  Typography,
  makeStyles,
  Box,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { GeneAutocomplete } from "../../main/shared/GeneAutocomplete/GeneAutocomplete";
import { getGenomicCoords, getExonCoords } from "../../../services/main";

import "./GetCoordinates.scss";
import {
  CoordsUtilsResponse,
  GenomicData,
} from "../../../services/ResponseModels";
import StrandSwitch from "../../main/shared/StrandSwitch/StrandSwitch";

const useStyles = makeStyles(() => ({
  strandSwitchLabel: {
    marginLeft: "0 !important",
  },
}));

const GetCoordinates: React.FC = () => {
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

  const [results, setResults] = useState<GenomicData | null>(null);
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
        console.log(warning);
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
            console.log(exonStart);
            console.log(match[1]);
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
      getExonCoords(chromosome, start, end, strand, gene).then(
        (coordsResponse) => handleResponse(coordsResponse)
      );
    } else if (inputType == "genomic_coords_tx") {
      getExonCoords(chromosome, start, end, strand, "", txAc).then(
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

  const renderResults = () => {
    if (inputValid) {
      if (results) {
        return (
          <Card className="coords-card">
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
              {results.exon_end
                ? renderRow("Exon end", results.exon_end)
                : null}
              {results.exon_end_offset
                ? renderRow("Exon end offset", results.exon_end_offset)
                : null}
            </Table>
          </Card>
        );
      } else if (error) {
        return <Typography>{error}</Typography>;
      }
    }
  };

  const genomicCoordinateInfo = (
    <>
      <Box display="flex" justifyContent="space-between" width="100%">
        <TextField
          margin="dense"
          style={{ height: 38, width: 125 }}
          value={chromosome}
          onChange={(event) => setChromosome(event.target.value)}
          error={chromosome && chromosomeText !== ""}
          helperText={chromosome && chromosomeText ? chromosomeText : null}
          label="Chromosome"
        />
        <Box className="inputs" mt="18px">
        <Box className="strand" width="125px">
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
            <Box className="inputs fields-pair">
              <GeneAutocomplete
                gene={gene}
                setGene={setGene}
                geneText={geneText}
                setGeneText={setGeneText}
                style={{ width: 125 }}
              />
            </Box>
            {genomicCoordinateInfo}
            <Box className="inputs fields-pair">
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
            <Box className="inputs fields-pair">
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Transcript"
                value={txAc}
                onChange={(event) => setTxAc(event.target.value)}
                error={txAcText !== ""}
                helperText={txAcText}
              />
            </Box>
            {genomicCoordinateInfo}
            <Box className="inputs fields-pair">
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
            <Box className="inputs">
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Transcript"
                value={txAc}
                onChange={(event) => setTxAc(event.target.value)}
                error={txAcText !== ""}
                helperText={txAcText}
              />
            </Box>
            <Box className="inputs fields-pair">
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
            <Box className="inputs fields-pair">
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

  return (
    <Box className="get-coordinates-tab-container">
      <Box className="left">
        <Box className="input-selector">
          <Box className="input-selector-child">
            <Select
              value={inputType}
              onChange={(event) => setInputType(event.target.value as string)}
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
          </Box>
        </Box>
        <Box className="input-params">{renderInputOptions()}</Box>
      </Box>
      <Box className="right">
        <Box className="coords-response-container">
          {
            // inputValid && results ?
            renderResults()
          }
        </Box>
      </Box>
    </Box>
  );
};

export default GetCoordinates;
