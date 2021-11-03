import {
  Card, CardContent, Button, TextField, MenuItem, FormLabel, Select, RadioGroup,
  FormControlLabel, Radio
} from '@material-ui/core';
import { useState } from 'react';
import {
  getTxSegmentComponentECT, getTxSegmentComponentGCG, getTxSegmentComponentGCT
} from '../../../../../services/main';
import { GeneAutocomplete } from '../../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { StructuralComponentInputProps } from '../StructCompInputProps';

const TxSegmentCompInput: React.FC<StructuralComponentInputProps> = (
  { index, id, handleSave, handleCancel }
) => {
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
              handleSave(index, id, txSegmentResponse.component);
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
              handleSave(index, id, txSegmentResponse.component);
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
              handleSave(index, id, txSegmentResponse.component);
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
};

export default TxSegmentCompInput;