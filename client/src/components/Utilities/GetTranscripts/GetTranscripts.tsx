import {
  Accordion, AccordionDetails, AccordionSummary, Box, Container, Typography
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
                      <Typography>
                        <b>RefSeq Nucleotide: </b>{transcript.RefSeq_nuc} <br />
                        <b>RefSeq Protein: </b>{transcript.RefSeq_prot} <br />
                        <b>Ensembl Nucleotide: </b>{transcript.Ensembl_nuc} <br />
                        <b>Ensembl Protein: </b>{transcript.Ensembl_prot} <br />
                        <b>Chromosome: </b>{transcript.GRCh38_chr} <br />
                        <b>Start: </b>{transcript.chr_start} <br />
                        <b>End: </b>{transcript.chr_end} <br />
                        <b>Strand: </b>{transcript.chr_strand} <br />
                      </Typography>
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
              onKeyDown={() => handleGet()}
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