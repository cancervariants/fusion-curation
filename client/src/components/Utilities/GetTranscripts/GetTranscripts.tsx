import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  makeStyles,
  Paper,
  Table,
  TableContainer,
  Typography,
  TableBody,
  TableRow,
  TableCell,
  Link,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { useEffect, useState } from "react";
import { useColorTheme } from "../../../global/contexts/Theme/ColorThemeContext";
import { getTranscripts } from "../../../services/main";
import { GeneAutocomplete } from "../../main/shared/GeneAutocomplete/GeneAutocomplete";
import HelpTooltip from "../../main/shared/HelpTooltip/HelpTooltip";
import TooltipTypography from "../../main/shared/HelpTooltip/TooltipTypography";

import "./GetTranscripts.scss";

export const GetTranscripts: React.FC = () => {
  const [gene, setGene] = useState("");
  const [geneText, setGeneText] = useState("");

  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [transcriptWarnings, setTranscriptWarnings] = useState<string[]>([]);

  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    left: {
      width: "40%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: colorTheme["--light-gray"],
      paddingBottom: "25px",
    },
    description: {
      backgroundColor: colorTheme["--medium-gray"],
      width: "100%",
      marginBottom: "20px",
    },
    descriptionText: {
      padding: "10px",
    },
  }));
  const classes = useStyles();

  useEffect(() => {
    if (gene !== "" && !geneText) {
      handleGet();
    } else if (gene == "") {
      setTranscriptWarnings([]);
    }
  }, [gene]);

  const handleGet = () => {
    getTranscripts(gene).then((transcriptsResponse) => {
      if (transcriptsResponse.warnings) {
        setTranscriptWarnings(transcriptsResponse.warnings);
        setTranscripts([]);
      } else {
        setTranscriptWarnings([]);
        setTranscripts(transcriptsResponse.transcripts);
      }
    });
  };

  const maneClinicalDescription = (
    <>
      <TooltipTypography>Per RefSeq:</TooltipTypography>
      <TooltipTypography>
        <i>
          The MANE Select set consists of one transcript at each protein-coding
          locus across the genome that is representative of biology at that
          locus. This set is useful as a universal standard for clinical
          reporting, as a default for display on browsers and key genomic
          resources, and as a starting point for comparative or evolutionary
          genomics. MANE Select transcripts are identified using computational
          methods complemented by manual review and discussion.
        </i>
      </TooltipTypography>
    </>
  );

  const maneSelectDescription = (
    <>
      <TooltipTypography>Per RefSeq:</TooltipTypography>
      <TooltipTypography>
        <i>
          The MANE Plus Clinical set includes additional transcripts for genes
          where MANE Select alone is not sufficient to report all "Pathogenic
          (P)" or "Likely Pathogenic (LP)" clinical variants available in public
          resources.
        </i>
      </TooltipTypography>
    </>
  );

  const renderTranscripts = () => {
    if (transcriptWarnings.length > 0) {
      // TODO more error handling here
      return <Box>{JSON.stringify(transcriptWarnings, null, 2)}</Box>;
    } else if (transcripts.length > 0) {
      return (
        <div>
          <Container className="tx-accordion">
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className="tx-accordion-top"
              >
                {transcripts[0].symbol}
              </AccordionSummary>
              <AccordionDetails className="tx-accordion-details">
                <Typography>
                  <b>Name:</b> {transcripts[0].name} <br />
                  <b>NCBI ID:</b> ncbigene:
                  {transcripts[0]["#NCBI_GeneID"].split(":")[1]} <br />
                  <b>Ensembl ID:</b> {transcripts[0].Ensembl_Gene} <br />
                  <b>HGNC ID:</b> {transcripts[0].HGNC_ID} <br />
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Container>
          {transcripts.map((transcript, index) => {
            const resultData = {
              "RefSeq Protein": transcript.RefSeq_nuc,
              "RefSeq Nucleotide": transcript.RefSeq_prot,
              "Ensembl Nucleotide": transcript.Ensembl_nuc,
              "Ensembl Protein": transcript.Ensembl_prot,
              Chromosome: transcript.GRCh38_chr,
              Start: transcript.chr_start,
              End: transcript.chr_end,
              Strand: transcript.chr_strand,
            };
            return (
              <Container key={index} className="tx-accordion">
                <Accordion>
                  <HelpTooltip
                    placement="left"
                    title={
                      transcript.MANE_status === "MANE Plus Clinical"
                        ? maneClinicalDescription
                        : maneSelectDescription
                    }
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      className="tx-accordion-top"
                    >
                      {transcript.MANE_status}
                    </AccordionSummary>
                  </HelpTooltip>
                  <AccordionDetails className="tx-accordion-details">
                    <TableContainer component={Paper}>
                      <Table aria-label="transcript-info-table" size="small">
                        <TableBody>
                          {Object.entries(resultData).map(
                            ([name, value], index) => (
                              <TableRow key={index}>
                                <TableCell align="left">
                                  <b>{name}</b>
                                </TableCell>
                                <TableCell align="left">{value}</TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              </Container>
            );
          })}
        </div>
      );
    } else {
      return <></>;
    }
  };

  // TODO: how to format/present the description
  return (
    <div className="get-transcripts-tab-container">
      <Box className={classes.left}>
        <Box className={classes.description}>
          <Box className={classes.descriptionText}>
            <Typography>
              This tool provides known transcripts from the Matched Annotation
              from the NCBI and EMBL-EMBI (MANE) project for a given gene term.{" "}
              See the{" "}
              <Link href="https://www.ncbi.nlm.nih.gov/refseq/MANE/">
                RefSeq MANE page
              </Link>{" "}
              for more information.
            </Typography>
          </Box>
        </Box>
        <Typography variant="h4">Enter a gene:</Typography>
        <div>
          <GeneAutocomplete
            gene={gene}
            setGene={setGene}
            geneText={geneText}
            setGeneText={setGeneText}
            style={{ width: 200 }}
            tooltipDirection="top"
          />
        </div>
      </Box>
      <div className="right">
        <div className="tx-response-container">{renderTranscripts()}</div>
      </div>
    </div>
  );
};
