import {
  Card, CardContent, Button, TextField, MenuItem, FormLabel, Select, RadioGroup,
  FormControlLabel, Radio
} from '@material-ui/core';
import { useContext, useEffect, useState } from 'react';
import { FusionContext } from '../../../../../global/contexts/FusionContext';
import {
  getTxSegmentComponentECT, getTxSegmentComponentGCG, getTxSegmentComponentGCT
} from '../../../../../services/main';
import { GeneAutocomplete } from '../../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { StructuralComponentInputProps } from '../StructCompInputProps';

const TxSegmentCompInput: React.FC<StructuralComponentInputProps> = (
  { index, id, handleSave, handleCancel }
) => {
  const [txInputType, setTxInputType] = useState('default');

  const [txAc, setTxAc] = useState('');
  const [txAcText, setTxAcText] = useState('');

  const [txGene, setTxGene] = useState('');
  const [txGeneText, setTxGeneText] = useState('');
  const [txGeneError, setTxGeneError] = useState(false);

  const [txStrand, setTxStrand] = useState('default');

  const [txChrom, setTxChrom] = useState('');
  const [txChromText, setTxChromText] = useState('');

  const [txStartingGenomic, setTxStartingGenomic] = useState('');
  const [txEndingGenomic, setTxEndingGenomic] = useState('');

  const [startingExon, setStartingExon] = useState('');
  const [endingExon, setEndingExon] = useState('');
  const [startingExonOffset, setStartingExonOffset] = useState('');
  const [endingExonOffset, setEndingExonOffset] = useState('');

  const { fusion, setFusion } = useContext(FusionContext);
  useEffect(() => {
    const prevValues = fusion.structural_components?.filter(comp => comp.component_id === id)[0];
    if (prevValues) {
      const fusionCopy = Object.assign({}, fusion);
      fusionCopy.structural_components.splice(fusion.structural_components.indexOf(prevValues), 1);
      setFusion(fusionCopy);
      setTxInputType(prevValues.input_type);
      switch(prevValues.input_type) {
        case 'genomic_coords_gene':
          setTxGene(prevValues.gene_descriptor.id.split(':')[1]);
          setTxChrom(
            prevValues.component_genomic_start.id.split(':')[1] ||
            prevValues.component_genomic_end.id.split(':')[1]
          );
          // setTxStrand();  // TODO ???
          setTxStartingGenomic(
            prevValues.component_genomic_start?.location.interval.end.value || ''
          );
          setTxEndingGenomic(
            prevValues.component_genomic_end?.location.interval.end.value || ''
          );
          break;
        case 'genomic_coords_tx':
          setTxAc(prevValues.transcript.split(':')[1]);
          setTxChrom(
            prevValues.component_genomic_start.id.split(':')[1] ||
            prevValues.component_genomic_end.id.split(':')[1]
          );
          // setTxStrand();  // TODO ???
          setTxStartingGenomic(
            prevValues.component_genomic_start?.location.interval.end.value || ''
          );
          setTxEndingGenomic(
            prevValues.component_genomic_end?.location.interval.end.value || ''
          );
          break;
        case 'exon_coords_tx':
          setTxAc(prevValues.transcript.split(':')[1]);
          setStartingExon(prevValues.exon_start || '');
          setStartingExonOffset(prevValues.exon_start_offset || '');
          setEndingExon(prevValues.exon_end || '');
          setEndingExonOffset(prevValues.exon_end_offset || '');
      }
    }
  }, []);

  const buildTranscriptSegmentComponent = () => {
    switch (txInputType) {
      case 'genomic_coords_gene':
        getTxSegmentComponentGCG(txGene, txChrom, txStartingGenomic, txEndingGenomic, txStrand)
          .then(txSegmentResponse => {
            if (txSegmentResponse.warnings?.length > 0) {
              const chromWarning = `Invalid chromosome: ${txChrom}`;
              if (txSegmentResponse.warnings.includes(chromWarning)) {
                setTxChromText('Unrecognized value');
              }
              // TODO other errors
            } else {
              handleSave(index, id, txSegmentResponse.component, txInputType);
            }
          });
        break;
      case 'genomic_coords_tx':
        getTxSegmentComponentGCT(txAc, txChrom, txStartingGenomic, txEndingGenomic, txStrand)
          .then(txSegmentResponse => {
            if (txSegmentResponse.warnings?.length > 0) {
              const chromWarning = `Invalid chromosome: ${txChrom}`;
              if (txSegmentResponse.warnings.includes(chromWarning)) {
                setTxChromText('Unrecognized value');
              }
            } else {
              handleSave(index, id, txSegmentResponse.component, txInputType);
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
                setTxAcText('Unrecognized value');
              }
            } else {
              handleSave(index, id, txSegmentResponse.component, txInputType);
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
                geneText={txGeneText}
                setGeneText={setTxGeneText}
                geneError={txGeneError}
                setGeneError={setTxGeneError}
                style={{ width: 125 }}
              />
            </div>
            <div className="mid-inputs">
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                value={txChrom}
                onChange={(event) => setTxChrom(event.target.value)}
                error={txChromText !== ''}
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
                error={txAcText !== ''}
                helperText={txAcText}
              />
            </div>
            <div className="mid-inputs">
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                value={txChrom}
                onChange={(event) => setTxChrom(event.target.value)}
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
                error={txAcText !== ''}
                helperText={txAcText}
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

  const disableAdd = (): boolean => {
    switch(txInputType) {
      case 'genomic_coords_gene':
        return (txGene === '' || txChrom === '' || txStrand === 'default' ||
          (txStartingGenomic === '' && txEndingGenomic === ''));
      case 'genomic_coords_tx':
        return (txAc === '' || txChrom === '' || txStrand === 'default' ||
          (txStartingGenomic === '' && txEndingGenomic === ''));
      case 'exon_coords_tx':
        return (txAc === '' || (startingExon === '' && endingExon === ''));
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
            <Button
              style={{ margin: '8px' }}
              variant="outlined"
              color="primary"
              onClick={buildTranscriptSegmentComponent}
              disabled={disableAdd()}
            >Save</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TxSegmentCompInput;