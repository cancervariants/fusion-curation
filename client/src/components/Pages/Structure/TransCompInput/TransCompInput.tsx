import { useState } from 'react';
import { Card, CardContent, Button, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { getGeneId, getGeneSuggestions } from '../../../../services/main';
import { getExon } from '../../../../services/main';

import './TransCompInput.scss';

interface Props {
  compType: string,
  index: number,
  id: string,
  handleSave: (index: number, compType, ...inputs: unknown[]) => void;
  handleCancel: (id: string) => void;
}

// TODO: disappear error onChange

export const TransCompInput: React.FC<Props> = (
  { compType, handleCancel, handleSave, index, id }
) => {
  //Genomic Region
  const [strand, setStrand] = useState('');
  const [chromosome, setChromosome] = useState('');
  const [startPosition, setStartPosition] = useState('');
  const [endPosition, setEndPosition] = useState('');

  // Transcript Segment
  const [transcriptError, setTranscriptError] = useState('');
  const [transcriptGeneError, setTranscriptGeneError] = useState('');
  const [txAc, setTxAc] = useState('');
  const [transcriptGene, setTranscriptGene] = useState('');
  const [startingExon, setStartingExon] = useState('');
  const [endingExon, setEndingExon] = useState('');
  const [startingExonOffset, setStartingExonOffset] = useState('');
  const [endingExonOffset, setEndingExonOffset] = useState('');

  /**
   * TODO:
   * - add handling of exon vs genomic position here
   * - think about how to handle gene esp if contradicts transcript
   * - long term: enable selection of transcript given gene
   */
  const transcriptValidate = () => {
    if (transcriptGene.length > 0) {
      getGeneId(transcriptGene)
        .then(geneResponse => {
          if (geneResponse.concept_id === null) {
            setTranscriptGeneError('Gene not found!');
            throw new Error(geneResponse.warnings.join(','));
          }
        })
        .catch(err => {
          console.error(err);
        })
        .then(res => {
          getExon(
            txAc, transcriptGene, parseInt(startingExon) || 0, parseInt(endingExon) || 0,
            parseInt(startingExonOffset) || 0, parseInt(endingExonOffset) || 0
          )
            .then(exonResponse => {
              if (exonResponse.tx_ac === null) {
                setTranscriptError('Transcript not found!');
                return;
              } else {
                handleSave(
                  index, compType, txAc, transcriptGene, parseInt(startingExon) || 0,
                  parseInt(endingExon) || 0, parseInt(startingExonOffset) || 0,
                  parseInt(endingExonOffset) || 0
                );
              }
            });
        });
    } else {
      getExon(
        txAc, transcriptGene, parseInt(startingExon) || 0, parseInt(endingExon) || 0,
        parseInt(startingExonOffset) || 0, parseInt(endingExonOffset) || 0
      ).then(exonResponse => {
        if (exonResponse.tx_ac === null) {
          setTranscriptError('Transcript not found!');
          return;
        } else {
          handleSave(
            index, compType, txAc, transcriptGene, parseInt(startingExon) || 0,
            parseInt(endingExon) || 0, parseInt(startingExonOffset) || 0,
            parseInt(endingExonOffset) || 0
          );
        }
      });
    }
  };

  // Linker Sequence
  const [sequence, setSequence] = useState('');
  const linkerError = sequence && sequence.match(/^([aAgGtTcC]+)?$/) === null;

  // Gene
  const [gene, setGene] = useState('');
  const [geneOptions, setGeneOptions] = useState([]);
  const [geneError, setGeneError] = useState('');

  const geneValidate = (symbol) => {
    if (symbol === 'ANY') {
      handleSave(index, compType, gene);
      return;
    }
    getGeneId(symbol)
      .then(geneResponse => {
        if (geneResponse.concept_id === null) {
          setGeneError('Gene not found!');
          return;
        } else {
          handleSave(index, compType, gene);
        }
      });
  };

  const handleGeneInput = (term: string) => {
    setGeneError('');
    getGeneSuggestions(term).then(responseJson => {
      const suggestions = [];
      responseJson.suggestions?.forEach(suggestion => {
        if (suggestion[0] === '') {
          suggestions.push(suggestion[2]);
        } else {
          suggestions.push(suggestion[0]);
        }
      });
      setGeneOptions(suggestions);
    });
  };

  const renderSwitch = (compType: string) => {
    switch (compType) {
      case 'genomic_region':
        return (
          <Card >
            <CardContent>
              <div className="card-parent">
                <div className="input-parent">
                  <div className="top-inputs">
                    <TextField
                      margin="dense"
                      style={{ height: 38, width: 125 }}
                      value={chromosome}
                      onChange={(event) => setChromosome(event.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSave(
                            index, compType, chromosome, strand, startPosition, endPosition
                          );
                        }
                      }}
                      label="Chromosome"></TextField>
                    <TextField
                      margin="dense"
                      style={{ height: 38, width: 125 }}
                      label="Strand"
                      value={strand}
                      onChange={(event) => setStrand(event.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSave(
                            index, compType, chromosome, strand, startPosition, endPosition
                          );
                        }
                      }}
                    ></TextField>
                  </div>
                  <div className="bottom-inputs">
                    <TextField
                      margin="dense"
                      style={{ height: 38, width: 125 }}
                      label="Start Position"
                      value={startPosition}
                      onChange={(event) => setStartPosition(event.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSave(
                            index, compType, chromosome, strand, startPosition, endPosition
                          );
                        }
                      }}
                    >
                    </TextField>
                    <TextField
                      margin="dense"
                      style={{ height: 38, width: 125 }}
                      label="End Position"
                      value={endPosition}
                      onChange={(event) => setEndPosition(event.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSave(
                            index, compType, chromosome, strand, startPosition, endPosition
                          );
                        }
                      }}
                    ></TextField>
                  </div>
                </div>
                <div className="buttons">
                  <Button
                    style={{ margin: '8px' }}
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleCancel(id)}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ margin: '8px' }}
                    variant="outlined"
                    color="primary"
                    onClick={() => handleSave(
                      index, compType, chromosome, strand, startPosition, endPosition
                    )}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'transcript_segment':
        return (
          <Card >
            <CardContent>
              <div className="card-parent">
                <div className="input-parent">
                  <div className="top-inputs">
                    <TextField
                      margin="dense"
                      style={{ width: 125 }}
                      label="Transcript"
                      value={txAc}
                      onChange={(event) => setTxAc(event.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') transcriptValidate(); }}
                      error={transcriptError.length > 0}
                      helperText={transcriptError}
                    ></TextField>
                    <Autocomplete
                      freeSolo
                      options={geneOptions}
                      getOptionLabel={(option) => option}
                      style={{ width: 125 }}
                      onChange={(event, value) => setGene(value)}
                      renderInput={(params) =>
                        <TextField
                          {...params}
                          label="Gene Symbol"
                          margin="dense"
                          style={{ width: 125 }}
                          variant="standard"
                          value={gene}
                          error={geneError !== ''}
                          onChange={event => {
                            if (event.target.value !== '' && event.target.value !== null) {
                              handleGeneInput(event.target.value);
                            }
                          }}
                          helperText={geneError !== '' ? geneError : null}
                        />
                      }
                    />
                  </div>
                  <div className="bottom-inputs">
                    <TextField
                      margin="dense"
                      style={{ width: 125 }}
                      label="Starting Exon"
                      value={startingExon}
                      onChange={(event) => setStartingExon(event.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') transcriptValidate(); }}
                    ></TextField>
                    <TextField
                      margin="dense"
                      style={{ width: 125 }}
                      label="Ending Exon"
                      value={endingExon}
                      onChange={(event) => setEndingExon(event.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') transcriptValidate(); }}
                    ></TextField>
                  </div>
                  {(startingExon !== '' || endingExon !== '') ?
                    <div className="bottom-inputs">
                      <TextField
                        margin="dense"
                        style={{ width: 125 }}
                        label="Starting Offset"
                        value={startingExonOffset}
                        onChange={(event) => setStartingExonOffset(event.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') transcriptValidate(); }}
                      ></TextField>
                      <TextField
                        margin="dense"
                        style={{ width: 125 }}
                        label="Ending Offset"
                        value={endingExonOffset}
                        onChange={(event) => setEndingExonOffset(event.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') transcriptValidate();
                        }}
                      ></TextField>
                    </div>
                    : null
                  }
                </div>
                <div className="buttons">
                  <Button
                    style={{ margin: '8px' }}
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleCancel(id)}
                  >
                    Cancel
                  </Button>
                  <Button style={{ margin: '8px' }} variant="outlined" color="primary"
                    onClick={transcriptValidate}
                  >Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'linker_sequence':
        return (
          <Card >
            <CardContent>
              <div className="card-parent">
                <div className="input-parent">
                  <TextField
                    margin="dense"
                    label="Sequence"
                    value={sequence}
                    onChange={(event) => setSequence(event.target.value.toUpperCase())}
                    error={linkerError}
                    helperText={linkerError ? 'Warning: must contain only {A, C, G, T}' : null}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSave(index, compType, sequence);
                      }
                    }}
                  ></TextField>
                </div>
                <div className="buttons">
                  <Button
                    style={{ margin: '8px' }}
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleCancel(id)}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ margin: '8px' }}
                    variant="outlined"
                    disabled={linkerError}
                    color="primary"
                    onClick={() => handleSave(index, compType, sequence)}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'gene':
        return (
          <Card >
            <CardContent>
              <div className="card-parent">
                <div className="input-parent">
                  <Autocomplete
                    freeSolo
                    options={geneOptions}
                    getOptionLabel={(option) => option}
                    onChange={(event, value) => setGene(value)}
                    renderInput={(params) =>
                      <TextField
                        {...params}
                        label="Gene Symbol"
                        margin="dense"
                        style={{ width: 200 }}
                        variant="standard"
                        value={gene}
                        error={geneError !== ''}
                        onChange={event => {
                          if (event.target.value !== '' && event.target.value !== null) {
                            handleGeneInput(event.target.value);
                          }
                        }}
                        helperText={geneError !== '' ? geneError : null}
                      />
                    }
                  />
                </div>
                <div className="buttons">
                  <Button
                    style={{ margin: '8px' }}
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleCancel(id)}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ margin: '8px' }}
                    variant="outlined"
                    color="primary"
                    onClick={() => geneValidate(gene)}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <>
      <div>
        {renderSwitch(compType)}
      </div>
    </>
  );
};