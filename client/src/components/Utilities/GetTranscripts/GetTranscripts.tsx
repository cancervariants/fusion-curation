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

export const GetTranscripts: React.FC = () => {
  const [gene, setGene] = useState("");
  const [geneText, setGeneText] = useState("");

  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [transcriptWarnings, setTranscriptWarnings] = useState<string[]>([]);

  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    titleContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 0 20px 0",
    },
    descriptionBox: {
      backgroundColor: colorTheme["--medium-gray"],
      width: "100%",
      display: "flex",
      justifyContent: "center",
    },
    descriptionBoxTextContainer: {
      width: "70%",
      padding: "10px",
    },
    transcriptsBodyContainer: {
      display: "flex",
      width: "100%",
      alignItems: "stretch",
      flex: "1",
    },
    leftColumn: {
      width: "40%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: colorTheme["--light-gray"],
      padding: "25px",
    },
    rightColumn: {
      display: "flex",
      flexDirection: "column",
      width: "60%",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    txResponseContainer: {
      overflowX: "hidden",
      overflowY: "scroll",
      textOverflow: "clip",
      padding: "20px 0 20px 0",
      width: "100%",
    },
    txAccordion: {
      width: "90%",
      paddingBottom: "1px",
      fontWeight: "bold",
    },
    txAccordionTop: {
      color: colorTheme["--primary"],
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
          The MANE Plus Clinical set includes additional transcripts for genes
          where MANE Select alone is not sufficient to report all "Pathogenic
          (P)" or "Likely Pathogenic (LP)" clinical variants available in public
          resources.
        </i>
      </TooltipTypography>
    </>
  );

  const maneSelectDescription = (
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

  const renderTranscripts = () => {
    if (transcriptWarnings.length > 0) {
      // TODO more error handling here
      return <Box>{JSON.stringify(transcriptWarnings, null, 2)}</Box>;
    } else if (transcripts.length > 0) {
      return (
        <div>
          <Container className={classes.txAccordion}>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className={classes.txAccordionTop}
              >
                {transcripts[0].symbol}
              </AccordionSummary>
              <AccordionDetails>
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
              <Container key={index} className={classes.txAccordion}>
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
                      className={classes.txAccordionTop}
                    >
                      {transcript.MANE_status}
                    </AccordionSummary>
                  </HelpTooltip>
                  <AccordionDetails>
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

  return (
    <Box className={classes.pageContainer}>
      <Box className={classes.header}>
        <Box className={classes.titleContainer}>
          <Typography variant="h4">Fetch MANE Transcripts</Typography>
        </Box>
        <Box className={classes.descriptionBox}>
          <Box className={classes.descriptionBoxTextContainer}>
            <Typography>
              This tool provides known transcripts from the Matched Annotation
              from the NCBI and EMBL-EMBI (MANE) project for a given gene term.
              See the{" "}
              <Link href="https://www.ncbi.nlm.nih.gov/refseq/MANE/">
                RefSeq MANE page
              </Link>{" "}
              for more information.
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className={classes.transcriptsBodyContainer}>
        <Box className={classes.leftColumn}>
          <Typography variant="h5">Enter a gene:</Typography>
          <Box>
            <GeneAutocomplete
              gene={gene}
              setGene={setGene}
              geneText={geneText}
              setGeneText={setGeneText}
              style={{ width: 200 }}
              tooltipDirection="top"
            />
          </Box>
        </Box>
        <Box className={classes.rightColumn}>
          <Box className={classes.txResponseContainer}>
            {renderTranscripts()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
