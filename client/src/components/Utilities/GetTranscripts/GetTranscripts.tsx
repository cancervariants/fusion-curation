import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  makeStyles,
  Table,
  TableContainer,
  Typography,
  TableBody,
  TableRow,
  TableCell,
  Link,
  Button,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { useEffect, useState } from "react";
import { useColorTheme } from "../../../global/contexts/Theme/ColorThemeContext";
import { getTranscripts } from "../../../services/main";
import {
  GeneDescriptor,
  GetTranscriptsResponse,
  ManePlusClinical,
  ManeSelect,
} from "../../../services/ResponseModels";
import { GeneAutocomplete } from "../../main/shared/GeneAutocomplete/GeneAutocomplete";
import { HelpPopover } from "../../main/shared/HelpPopover/HelpPopover";
import HelpTooltip from "../../main/shared/HelpTooltip/HelpTooltip";
import TabHeader from "../../main/shared/TabHeader/TabHeader";
import TabPaper from "../../main/shared/TabPaper/TabPaper";
import AssignmentIcon from "@material-ui/icons/Assignment";
import copy from "clipboard-copy";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";

export const GetTranscripts: React.FC = () => {
  const [gene, setGene] = useState("");
  const [geneText, setGeneText] = useState("");

  // const [transcripts, setTranscripts] = useState<[]>([]);
  const [geneDescriptor, setGeneDescriptor] = useState<GeneDescriptor | null>(
    null
  );
  const [manePlusTx, setManePlusTx] = useState<ManePlusClinical | null>(null);
  const [maneSelectTx, setManeSelectTx] = useState<ManeSelect | null>(null);
  const [transcriptWarnings, setTranscriptWarnings] = useState<string[]>([]);

  const [isCopied, setIsCopied] = useState<boolean>(false);

  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    pageContainer: {
      paddingBottom: "32px",
    },
    inputContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "25px",
    },
    txResponseContainer: {
      overflowX: "hidden",
      overflowY: "scroll",
      textOverflow: "clip",
      width: "100%",
    },
    txAccordionContainer: {
      width: "90%",
      paddingBottom: "1px",
      fontWeight: "bold",
      padding: "0px",
    },
    txAccordionTop: {
      color: colorTheme["--primary"],
    },
    resultsContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    copyButton: {
      marginTop: "20px",
      width: "100px",
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
    getTranscripts(gene).then((transcriptsResponse: GetTranscriptsResponse) => {
      if (transcriptsResponse.warnings) {
        setTranscriptWarnings(transcriptsResponse.warnings);
        setGeneDescriptor(null);
        setManePlusTx(null);
        setManeSelectTx(null);
      } else {
        setTranscriptWarnings([]);
        setGeneDescriptor(transcriptsResponse.gene as GeneDescriptor);
        setManePlusTx(
          transcriptsResponse.mane_plus_clinical_tx as ManePlusClinical
        );
        setManeSelectTx(transcriptsResponse.mane_select_tx as ManeSelect);
      }
    });
  };

  const maneClinicalDescription = (
    <>
      <Typography>Per RefSeq:</Typography>
      <Typography>
        <i>
          The MANE Plus Clinical set includes additional transcripts for genes
          where MANE Select alone is not sufficient to report all "Pathogenic
          (P)" or "Likely Pathogenic (LP)" clinical variants available in public
          resources.
        </i>
      </Typography>
    </>
  );

  const maneSelectDescription = (
    <>
      <Typography>Per RefSeq:</Typography>
      <Typography>
        <i>
          The MANE Select set consists of one transcript at each protein-coding
          locus across the genome that is representative of biology at that
          locus. This set is useful as a universal standard for clinical
          reporting, as a default for display on browsers and key genomic
          resources, and as a starting point for comparative or evolutionary
          genomics. MANE Select transcripts are identified using computational
          methods complemented by manual review and discussion.
        </i>
      </Typography>
    </>
  );

  const handleCopy = async () => {
    copy(
      JSON.stringify(
        {
          gene: geneDescriptor,
          mane_plus_clinical_tx: manePlusTx,
          mane_select_tx: maneSelectTx,
        },
        null,
        2
      )
    );
    setIsCopied(true);
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await sleep(1500);
    setIsCopied(false);
  };

  const renderTranscripts = () => {
    if (transcriptWarnings.length > 0) {
      // TODO more error handling here
      return <Box>{JSON.stringify(transcriptWarnings, null, 2)}</Box>;
    } else if (transcripts.length > 0) {
      return (
        <Box className={classes.resultsContainer}>
          <Container className={classes.txAccordionContainer}>
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
          {transcripts.map((transcript, index: number) => {
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
              <Container key={index} className={classes.txAccordionContainer}>
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
                    <TableContainer>
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
          <Button
            startIcon={
              !isCopied ? <AssignmentIcon /> : <AssignmentTurnedInIcon />
            }
            color="primary"
            variant="contained"
            className={classes.copyButton}
            onClick={handleCopy}
          >
            {!isCopied ? "Copy" : "Copied!"}
          </Button>
        </Box>
      );
    } else {
      return <></>;
    }
  };

  const transcriptsSubHeader = (
    <>
      Retrieve matching gene transcripts from the MANE project
      <HelpPopover>
        <Typography>
          Matched Annotation from the NCBI and EMBL-EBI (MANE) defines
          high-quality representative sets of transcripts matched to RefSeq and
          Ensembl/GENCODE annotations and aligned perfectly to the GRCh38
          reference assembly.
        </Typography>
        <Typography>
          For more information, see the{" "}
          <Link
            target="_blank"
            rel="noopener"
            href="https://www.ncbi.nlm.nih.gov/refseq/MANE/"
          >
            RefSeq MANE project page
          </Link>
          .
        </Typography>
      </HelpPopover>
    </>
  );

  const inputField = (
    <Box className={classes.inputContainer}>
      <Typography variant="h5">Enter a gene:</Typography>
      <Box>
        <GeneAutocomplete
          gene={gene}
          setGene={setGene}
          geneText={geneText}
          setGeneText={setGeneText}
          style={{ width: 200 }}
          tooltipDirection="right"
          promptText="gene term"
        />
      </Box>
    </Box>
  );

  return (
    <Box className={classes.pageContainer}>
      <TabHeader
        title="Fetch MANE Transcripts"
        subHeader={transcriptsSubHeader}
      />
      <TabPaper
        leftColumn={inputField}
        leftColumnWidth={30}
        rightColumn={
          <Box className={classes.txResponseContainer}>
            {renderTranscripts()}
          </Box>
        }
      />
    </Box>
  );
};
