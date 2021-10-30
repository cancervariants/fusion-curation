import { useState } from 'react';
import {
  Card, CardContent, Button, TextField, Select, MenuItem, FormLabel, RadioGroup, Radio,
  FormControlLabel
} from '@material-ui/core';
import { GeneAutocomplete } from '../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import {
  getGeneComponent, getTxSegmentComponentECT, getTxSegmentComponentGCT, getTxSegmentComponentGCG,
  getTemplatedSequenceComponent
} from '../../../../services/main';
import { LinkerComponent } from '../../../../services/ResponseModels';
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
  // Templated sequence
  const [strand, setStrand] = useState('');
  const [chromosome, setChromosome] = useState('');
  const [startPosition, setStartPosition] = useState('');
  const [endPosition, setEndPosition] = useState('');

  const buildTemplatedSequenceComponent = () => {
    getTemplatedSequenceComponent(chromosome, strand, startPosition, endPosition)
      .then(templatedSequenceResponse => {
        if (templatedSequenceResponse.warnings.length > 0) {
          // TODO error handling
          return;
        } else {
          handleSave(index, templatedSequenceResponse.component);
        }
      });
  };

  // Transcript Segment
  /**
   * TODO:
   * - add handling of exon vs genomic position here
   * - think about how to handle gene esp if contradicts transcript
   * - long term: enable selection of transcript given gene
   */
  const [txInputType, setTxInputType] = useState('default');
  const [txError, setTxError] = useState('');
  const [txGeneError, setTxGeneError] = useState('');
  const [txAc, setTxAc] = useState('');
  const [txGene, setTxGene] = useState('');
  const [txStrand, setTxStrand] = useState('default');
  const [txChromosome, setTxChromosome] = useState('');
  const [txStartingGenomic, setTxStartingGenomic] = useState('');
  const [txEndingGenomic, setTxEndingGenomic] = useState('');
  const [startingExon, setStartingExon] = useState('');
  const [endingExon, setEndingExon] = useState('');
  const [startingExonOffset, setStartingExonOffset] = useState('');
  const [endingExonOffset, setEndingExonOffset] = useState('');

  const buildTranscriptSegmentComponent = () => {
    switch (txInputType) {
      case 'genomic_coords_gene':
        getTxSegmentComponentGCG(txGene, txChromosome, txStartingGenomic, txEndingGenomic, txStrand)
          .then(txSegmentResponse => {
            if (txSegmentResponse.warnings?.length > 0) {
              const txWarning = `TODO warning ${txGene}`;
              if (txSegmentResponse.warnings.includes(txWarning)) {
                setTxError(txWarning);
              }
            } else {
              handleSave(index, txSegmentResponse.component);
            }
          });
        break;
      case 'genomic_coords_tx':
        getTxSegmentComponentGCT(txAc, txChromosome, txStartingGenomic, txEndingGenomic, txStrand)
          .then(txSegmentResponse => {
            if (txSegmentResponse.warnings?.length > 0) {
              const txWarning = `TODO warning ${txAc}`;
              if (txSegmentResponse.warnings.includes(txWarning)) {
                setTxError(txWarning);
              }
            } else {
              handleSave(index, txSegmentResponse.component);
            }
          });
        break;
      case 'exon_coords_tx':
        getTxSegmentComponentECT(
          txAc, startingExon, endingExon, startingExonOffset, endingExonOffset
        )
          .then(txSegmentResponse => {
            if (txSegmentResponse.warnings?.length > 0) {
              const txWarning = `Unable to get exons for ${txAc}`;
              if (txSegmentResponse.warnings.includes(txWarning)) {
                setTxError(txWarning);
              }
            } else {
              handleSave(index, txSegmentResponse.component);
            }
          });
    }
  };

  const renderTxOptions = () => {
    switch (txInputType) {
      case 'genomic_coords_gene':
        return (
          <div>
            <div className="mid-inputs">
              <GeneAutocomplete
                selectedGene={txGene}
                setSelectedGene={setTxGene}
                geneError={txGeneError}
                setGeneError={setTxGeneError}
                style={{ width: 125 }}
              />
            </div>
            <div className="mid-inputs">
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                value={txChromosome}
                onChange={(event) => setTxChromosome(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTranscriptSegmentComponent();
                  }
                }}
                label="Chromosome"
              />
              <FormLabel component="legend">Strand</FormLabel>
              <RadioGroup
                aria-label="strand"
                name="strand"
                value={txStrand}
                onChange={(event) => setTxStrand(event.target.value as string)}
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
                value={txStartingGenomic}
                onChange={(event) => setTxStartingGenomic(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTranscriptSegmentComponent();
                  }
                }}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Ending Position"
                value={txEndingGenomic}
                onChange={(event) => setTxEndingGenomic(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTranscriptSegmentComponent();
                  }
                }}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTranscriptSegmentComponent();
                  }
                }}
                error={txError.length > 0}
                helperText={setTxError}
              />
            </div>
            <div className="mid-inputs">
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                value={txChromosome}
                onChange={(event) => setTxChromosome(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTranscriptSegmentComponent();
                  }
                }}
                label="Chromosome"
              />
              <FormLabel component="legend">Strand</FormLabel>
              <RadioGroup
                aria-label="strand"
                name="strand"
                value={txStrand}
                onChange={(event) => setTxStrand(event.target.value as string)}
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
                value={txStartingGenomic}
                onChange={(event) => setTxStartingGenomic(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTranscriptSegmentComponent();
                  }
                }}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Ending Position"
                value={txEndingGenomic}
                onChange={(event) => setTxEndingGenomic(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTranscriptSegmentComponent();
                  }
                }}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTranscriptSegmentComponent();
                  }
                }}
                error={txError.length > 0}
                helperText={txError}
              />
            </div>
            <div className="bottom-inputs">
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Starting Exon"
                value={startingExon}
                onChange={(event) => setStartingExon(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTranscriptSegmentComponent();
                  }
                }}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Ending Exon"
                value={endingExon}
                onChange={(event) => setEndingExon(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buildTranscriptSegmentComponent();
                  }
                }}
              />
            </div>
            {(startingExon !== '' || endingExon !== '') ?
              <div className="bottom-inputs">
                <TextField
                  margin="dense"
                  style={{ width: 125 }}
                  label="Starting Offset"
                  value={startingExonOffset}
                  onChange={(event) => setStartingExonOffset(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      buildTranscriptSegmentComponent();
                    }
                  }}
                />
                <TextField
                  margin="dense"
                  style={{ width: 125 }}
                  label="Ending Offset"
                  value={endingExonOffset}
                  onChange={(event) => setEndingExonOffset(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      buildTranscriptSegmentComponent();
                    }
                  }}
                />
              </div>
              : null
            }
          </div>
        );
    }
  };

  // Linker Sequence
  const [sequence, setSequence] = useState('');
  const linkerError = sequence && sequence.match(/^([aAgGtTcC]+)?$/) === null;

  const buildLinkerComponent = () => {
    const linkerComponent: LinkerComponent = {
      component_type: 'linker_sequence',
      linker_sequence: {
        id: `fusor.sequence:${sequence}`,
        type: 'SequenceDescriptor',
        sequence: sequence,
        residue_type: 'SO:0000348'
      }
    };
    handleSave(index, linkerComponent);
  };

  // Gene
  const [gene, setGene] = useState<string>('');
  const [geneError, setGeneError] = useState('');

  const buildGeneComponent = (term: string) => {
    getGeneComponent(term)
      .then(geneComponentResponse => {
        if (geneComponentResponse.warnings?.length > 0) {
          setGeneError('Gene not found');
          return;
        } else {
          handleSave(index, geneComponentResponse.component);
        }
      });
  };


  const renderSwitch = (compType: string) => {
    switch (compType) {
      case 'templated_sequence':
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
                          buildTemplatedSequenceComponent();
                        }
                      }}
                      label="Chromosome"
                    />
                    <TextField
                      margin="dense"
                      style={{ height: 38, width: 125 }}
                      label="Strand"
                      value={strand}
                      onChange={(event) => setStrand(event.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          buildTemplatedSequenceComponent();
                        }
                      }}
                    />
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
                          buildTemplatedSequenceComponent();
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
                          buildTemplatedSequenceComponent();
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
                    onClick={() => buildTemplatedSequenceComponent()}
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
                    <Select
                      value={txInputType}
                      onChange={(event) => setTxInputType(event.target.value as string)}
                    >
                      <MenuItem value="default" disabled>Select input data</MenuItem>
                      <MenuItem value="genomic_coords_gene">Genomic coordinates, gene</MenuItem>
                      <MenuItem value="genomic_coords_tx">Genomic coordinates, transcript</MenuItem>
                      <MenuItem value="exon_coords_tx">Exon coordinates, transcript</MenuItem>
                    </Select>
                  </div>
                  {renderTxOptions()}
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
                    onClick={buildTranscriptSegmentComponent}
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
                        buildLinkerComponent();
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
                    onClick={buildLinkerComponent}
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
                  <GeneAutocomplete
                    selectedGene={gene}
                    setSelectedGene={setGene}
                    geneError={geneError}
                    setGeneError={setGeneError}
                    style={{ width: 125 }}
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
                    onClick={() => buildGeneComponent(gene)}
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