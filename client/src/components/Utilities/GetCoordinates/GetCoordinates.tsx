import {
  Select, MenuItem, TextField, RadioGroup, FormControlLabel, Radio, FormLabel, Table, TableRow,
  TableCell, Card
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { GeneAutocomplete } from '../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { getGenomicCoords, getExonCoords } from '../../../services/main';

import './GetCoordinates.scss';
import { GenomicData } from '../../../services/ResponseModels';

const GetCoordinates: React.FC = () => {
  const [inputType, setInputType] = useState('default');

  const [txAc, setTxAc] = useState('');
  const [txAcText, setTxAcText] = useState('');

  const [gene, setGene] = useState('');
  const [geneText, setGeneText] = useState('');

  const [strand, setStrand] = useState('default');

  const [chromosome, setChromosome] = useState('');
  const [chromosomeText, setChromosomeText] = useState('');

  const [start, setStart] = useState('');
  const [startText, setStartText] = useState('');
  const [end, setEnd] = useState('');
  const [endText, setEndText] = useState('');

  const [exonStart, setExonStart] = useState('');
  const [exonEnd, setExonEnd] = useState('');
  const [exonStartOffset, setExonStartOffset] = useState('');
  const [exonEndOffset, setExonEndOffset] = useState('');

  const [results, setResults] = useState<GenomicData | null>(null);

  // programming horror
  const inputComplete = (
    (
      (inputType === 'genomic_coords_gene') && (gene !== '') && (chromosome !== '') &&
      (strand !== 'default') && ((start !== '') || (end !== ''))
    ) ||
    (
      (inputType === 'genomic_coords_tx') && (txAc !== '') && (chromosome !== '') &&
      (strand !== 'default') && ((start !== '') || (end !== ''))
    ) ||
    (
      (inputType === 'exon_coords_tx') && (txAc !== '') &&
      ((exonStart !== '') || (exonEnd !== ''))
    )
  );

  const inputSuccessful = inputComplete && (geneText === '') && (chromosomeText === '') &&
    (txAcText === '');


  useEffect(() => {
    if (inputComplete) {
      fetchResults();
    }
  }, [
    txAc, gene, strand, chromosome, start, end, exonStart, exonEnd, exonStartOffset,
    exonEndOffset
  ]);

  const fetchResults = () => {
    if (inputType == 'exon_coords_tx') {
      getGenomicCoords(gene, txAc, exonStart, exonEnd, exonStartOffset, exonEndOffset)
        .then(coordsResponse => {
          if (coordsResponse.warnings) {
            // handle warnings TODO
          } else {
            // clear warnings TODO
            setResults(coordsResponse.coordinates_data);
          }
        });
    } else if (inputType == 'genomic_coords_gene') {
      getExonCoords(chromosome, start, end, strand, gene)
        .then(coordsResponse => {
          if (coordsResponse.warnings) {
            // handle warnings TODO
          } else {
            // clear warnings TODO
            setResults(coordsResponse.coordinates_data);
          }
        });
    } else if (inputType == 'genomic_coords_tx') {
      getExonCoords(chromosome, start, end, strand, null, txAc)
        .then(coordsResponse => {
          if (coordsResponse.warnings) {
            // handle warnings TODO
          } else {
            // clear warnings TODO
            setResults(coordsResponse.coordinates_data);
          }
        });
    }
  };

  const renderRow = (title: string, value: string | number) => (
    <TableRow>
      <TableCell align="left"><b>{title}</b></TableCell>
      <TableCell align="left">{value}</TableCell>
    </TableRow>
  );

  const renderResults = () => {
    return (
      <Card className="coords-card">
        <Table>
          {renderRow('Gene', results.gene)}
          {renderRow('Chromosome', results.chr)}
          {
            results.start ?
              renderRow('Genomic start', results.start) :
              null
          }
          {
            results.end ?
              renderRow('Genomic end', results.end) :
              null
          }
          {
            results.strand ?
              renderRow('Strand', results.strand === 1 ? '+' : '-') :
              null
          }
          {renderRow('Transcript', results.transcript)}
          {
            results.exon_start ?
              renderRow('Exon start', results.exon_start) :
              null
          }
          {
            results.exon_start_offset ?
              renderRow('Exon start offset', results.exon_start_offset) :
              null
          }
          {
            results.exon_end ?
              renderRow('Exon end', results.exon_end) :
              null
          }
          {
            results.exon_end_offset ?
              renderRow('Exon end offset', results.exon_end_offset) :
              null
          }
        </Table>
      </Card>
    );
  };

  const renderInputOptions = () => {
    switch (inputType) {
      case 'genomic_coords_gene':
        return (
          <div>
            <div className="mid-inputs">
              <GeneAutocomplete
                selectedGene={gene}
                setSelectedGene={setGene}
                geneText={geneText}
                setGeneText={setGeneText}
                style={{ width: 125 }}
              />
            </div>
            <div className="mid-inputs">
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                value={chromosome}
                onChange={(event) => setChromosome(event.target.value)}
                error={chromosomeText !== ''}
                label="Chromosome"
              />
              <FormLabel component="legend">Strand</FormLabel>
              <RadioGroup
                aria-label="strand"
                name="strand"
                value={strand}
                onChange={(event) => setStrand(event.target.value as string)}
                row
              >
                <FormControlLabel value="+" control={<Radio />} label="+" />
                <FormControlLabel value="-" control={<Radio />} label="-" />
              </RadioGroup>
            </div>
            <div className="bottom-inputs">
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
            </div>
          </div>
        );
      case 'genomic_coords_tx':
        return (
          <div>
            <div className="mid-inputs">
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Transcript"
                value={txAc}
                onChange={(event) => setTxAc(event.target.value)}
                error={txAcText !== ''}
                helperText={txAcText}
              />
            </div>
            <div className="mid-inputs">
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                value={chromosome}
                onChange={(event) => setChromosome(event.target.value)}
                label="Chromosome"
              />
              <FormLabel component="legend">Strand</FormLabel>
              <RadioGroup
                aria-label="strand"
                name="strand"
                value={strand}
                onChange={(event) => setStrand(event.target.value as string)}
                row
              >
                <FormControlLabel value="+" control={<Radio />} label="+" />
                <FormControlLabel value="-" control={<Radio />} label="-" />
              </RadioGroup>
            </div>
            <div className="bottom-inputs">
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
            </div>
          </div>
        );
      case 'exon_coords_tx':
        return (
          <div>
            <div className="mid-inputs">
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Transcript"
                value={txAc}
                onChange={(event) => setTxAc(event.target.value)}
                error={txAcText !== ''}
                helperText={txAcText}
              />
            </div>
            <div className="bottom-inputs">
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Starting Exon"
                value={exonStart}
                onChange={(event) => setExonStart(event.target.value)}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Ending Exon"
                value={exonEnd}
                onChange={(event) => setExonEnd(event.target.value)}
              />
            </div>
            {(exonStart !== '' || exonEnd !== '') ?
              <div className="bottom-inputs">
                <TextField
                  margin="dense"
                  style={{ width: 125 }}
                  label="Starting Offset"
                  value={exonStartOffset}
                  onChange={(event) => setExonStartOffset(event.target.value)}
                />
                <TextField
                  margin="dense"
                  style={{ width: 125 }}
                  label="Ending Offset"
                  value={exonEndOffset}
                  onChange={(event) => setExonEndOffset(event.target.value)}
                />
              </div>
              : null
            }
          </div>
        );
    }
  };

  return (
    <div className='get-coordinates-tab-container'>
      <div className='left'>
        <div className='blurb-container'>
          <div className='blurb'>
            <Select
              value={inputType}
              onChange={(event) => setInputType(event.target.value as string)}
            >
              <MenuItem value="default" disabled>Select input data</MenuItem>
              <MenuItem value="genomic_coords_gene">Genomic coordinates, gene</MenuItem>
              <MenuItem value="genomic_coords_tx">Genomic coordinates, transcript</MenuItem>
              <MenuItem value="exon_coords_tx">Exon coordinates, transcript</MenuItem>
            </Select>
            {renderInputOptions()}
          </div>
        </div>
      </div>
      <div className='right'>
        <div className='coords-response-container'>
          {
            inputSuccessful && results ?
              renderResults() :
              (<></>)
          }
        </div>
      </div>
    </div>
  );
};

export default GetCoordinates;