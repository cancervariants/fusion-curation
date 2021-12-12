import {
  Accordion, AccordionDetails, AccordionSummary, Box, Container, Paper, Table, TableContainer,
  Typography, TableBody, TableRow, TableCell,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React, { useEffect, useState } from 'react';
import { getTranscripts } from '../../../services/main';
import { GeneAutocomplete } from '../../main/shared/GeneAutocomplete/GeneAutocomplete';

import './GetTranscripts.scss';

export const GetTranscripts: React.FC = () => {
  const [gene, setGene] = useState('');
  const [geneText, setGeneText] = useState('');

  const [transcripts, setTranscripts] = useState([]);
  const [transcriptWarnings, setTranscriptWarnings] = useState([]);

  useEffect(() => {
    if ((gene !== '') && (!geneText)) {
      handleGet();
    } else if (gene == '') {
      setTranscriptWarnings([]);
    }
  }, [gene]);

  const handleGet = () => {
    getTranscripts(gene)
      .then(transcriptsResponse => {
        if (transcriptsResponse.warnings) {
          setTranscriptWarnings(transcriptsResponse.warnings);
          setTranscripts([]);
        } else {
          setTranscriptWarnings([]);
          setTranscripts(transcriptsResponse.transcripts);
        }
      });
  };

  const renderTranscripts = () => {
    if (transcriptWarnings.length > 0) {
      // TODO more error handling here
      return (
        <Box>{JSON.stringify(transcriptWarnings, null, 2)}</Box>
      );
    } else if (transcripts.length > 0) {
      return (
        <div>
          <Container className='tx-accordion'>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className='tx-accordion-top'
              >
                {transcripts[0].symbol}
              </AccordionSummary>
              <AccordionDetails className='tx-accordion-details'>
                <Typography>
                  <b>Name:</b> {transcripts[0].name} <br />
                  <b>NCBI ID:</b> ncbigene:{transcripts[0]['#NCBI_GeneID'].split(':')[1]} <br />
                  <b>Ensembl ID:</b> {transcripts[0].Ensembl_Gene} <br />
                  <b>HGNC ID:</b> {transcripts[0].HGNC_ID} <br />
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Container>
          {
            transcripts.map((transcript, index) => {
              const resultData = {
                'RefSeq Protein': transcript.RefSeq_nuc,
                'RefSeq Nucleotide': transcript.RefSeq_prot,
                'Ensembl Nucleotide': transcript.Ensembl_nuc,
                'Ensembl Protein': transcript.Ensembl_prot,
                'Chromosome': transcript.GRCh38_chr,
                'Start': transcript.chr_start,
                'End': transcript.chr_end,
                'Strand': transcript.chr_strand,
              };
              return (
                <Container
                  key={index}
                  className='tx-accordion'
                >
                  <Accordion >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      className='tx-accordion-top'
                    >
                      {transcript.MANE_status}
                    </AccordionSummary>
                    <AccordionDetails
                      className='tx-accordion-details'
                    >
                      <TableContainer component={Paper}>
                        <Table aria-label="transcript-info-table" size="small">
                          <TableBody>
                            {
                              Object.entries(resultData).map(([name, value], index) => (
                                <TableRow key={index}>
                                  <TableCell align='left'>
                                    <b>{name}</b>
                                  </TableCell>
                                  <TableCell align='left'>
                                    {value}
                                  </TableCell>
                                </TableRow>
                              ))
                            }
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                </Container>
              );
            })
          }
        </div>
      );
    } else {
      return (<></>);
    }
  };

  return (
    <div className='get-transcripts-tab-container'>
      <div className='left'>
        <div className='blurb-container'>
          <div className='blurb'>
            Enter a gene:
          </div>
          <div>
            <GeneAutocomplete
              selectedGene={gene}
              setSelectedGene={setGene}
              geneText={geneText}
              setGeneText={setGeneText}
              style={{ width: 200 }}
            />
          </div>
        </div>
      </div>
      <div className='right'>
        <div className='tx-response-container'>
          {renderTranscripts()}
        </div>
      </div>
    </div>
  );
};