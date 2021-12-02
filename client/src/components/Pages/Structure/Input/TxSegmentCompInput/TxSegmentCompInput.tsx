import {
  TextField, MenuItem, FormLabel, Select, RadioGroup,
  FormControlLabel, Radio, Accordion, AccordionDetails, AccordionSummary, Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import { red, green } from '@material-ui/core/colors';
import {
  ClientTranscriptSegmentComponent, TranscriptSegmentComponent, TxSegmentComponentResponse
} from '../../../../../services/ResponseModels';
import { useEffect, useState, KeyboardEvent } from 'react';
import {
  getTxSegmentComponentECT, getTxSegmentComponentGCG, getTxSegmentComponentGCT
} from '../../../../../services/main';
import { GeneAutocomplete } from '../../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { StructuralComponentInputProps } from '../StructCompInputProps';

interface TxSegmentComponentInputProps extends StructuralComponentInputProps {
  component: ClientTranscriptSegmentComponent;
}

const TxSegmentCompInput: React.FC<TxSegmentComponentInputProps> = (
  { component, index, handleSave, handleDelete }
) => {
  const [txInputType, setTxInputType] = useState(component.input_type || 'default');

  const [txAc, setTxAc] = useState(component.input_tx || '');
  const [txAcText, setTxAcText] = useState('');

  const [txGene, setTxGene] = useState(component.input_gene || '');
  const [txGeneText, setTxGeneText] = useState('');

  const [txStrand, setTxStrand] = useState(component.input_strand || 'default');

  const [txChrom, setTxChrom] = useState(component.input_chr || '');
  const [txChromText, setTxChromText] = useState('');

  const [txStartingGenomic, setTxStartingGenomic] = useState(component.input_genomic_start || '');
  const [txEndingGenomic, setTxEndingGenomic] = useState(component.input_genomic_end || '');

  const [startingExon, setStartingExon] = useState(component.exon_start || '');
  const [endingExon, setEndingExon] = useState(component.exon_end || '');
  const [startingExonOffset, setStartingExonOffset] = useState(component.exon_start_offset || '');
  const [endingExonOffset, setEndingExonOffset] = useState(component.exon_end_offset || '');

  // programming horror
  const inputComplete = (
    (
      (txInputType === 'genomic_coords_gene') && (txGene !== '') && (txChrom !== '') &&
      (txStrand !== 'default') && ((txStartingGenomic !== '') || (txEndingGenomic !== ''))
    ) ||
    (
      (txInputType === 'genomic_coords_tx') && (txAc !== '') && (txChrom !== '') &&
      (txStrand !== 'default') && ((txStartingGenomic !== '') || (txEndingGenomic !== ''))
    ) ||
    (
      (txInputType === 'exon_coords_tx') && (txAc !== '') &&
      ((startingExon !== '') || (endingExon !== ''))
    )
  );

  const inputSuccessful = inputComplete && (txGeneText === '') && (txChromText === '') &&
    (txAcText === '');

  const [expanded, setExpanded] = useState<boolean>(!inputSuccessful);

  useEffect(() => {
    if (inputComplete) {
      buildTranscriptSegmentComponent();
    }
  }, [
    txAc, txGene, txStrand, txChrom, txStartingGenomic, txEndingGenomic, startingExon,
    endingExon, startingExonOffset, endingExonOffset
  ]);

  const handleTxComponentResponse = (
    txSegmentResponse: TxSegmentComponentResponse, inputParams: Record<string, string>,
  ) => {
    const responseComponent = txSegmentResponse.component as TranscriptSegmentComponent;
    const finishedComponent: ClientTranscriptSegmentComponent = {
      ...component,
      ...responseComponent,
      ...inputParams,
    };

    let eso: string;
    if (finishedComponent.exon_start_offset > 0) {
      eso = `+${finishedComponent.exon_start_offset}`;
    } else if (finishedComponent.exon_start_offset < 0) {
      eso = `${finishedComponent.exon_start_offset}`;
    } else {
      eso = '';
    }

    let eeo: string;
    if (finishedComponent.exon_end_offset > 0) {
      eeo = `+${finishedComponent.exon_end_offset}`;
    } else if (finishedComponent.exon_end_offset < 0) {
      eeo = `${finishedComponent.exon_end_offset}`;
    } else {
      eeo = '';
    }

    let hrExon: string;
    if (finishedComponent.exon_start && finishedComponent.exon_end) {
      hrExon = `e.${finishedComponent.exon_start}${eso}_${finishedComponent.exon_end}${eeo}`;
    } else if (finishedComponent.exon_start) {
      hrExon = `e.${finishedComponent.exon_start}${eso}_`;
    } else {
      hrExon = `e._${finishedComponent.exon_end}${eeo}`;
    }

    const responseGeneSymbol = finishedComponent.gene_descriptor.label;
    const txAcName = finishedComponent.transcript.split(':')[1];

    finishedComponent.component_name = `${txAcName} ${responseGeneSymbol}`;
    finishedComponent.hr_name = `${txAcName}(${responseGeneSymbol}):${hrExon}`;
    handleSave(index, finishedComponent);
  };

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
              const inputParams = {
                input_type: txInputType,
                input_strand: txStrand,
                input_gene: txGene,
                input_chr: txChrom,
                input_genomic_start: txStartingGenomic,
                input_genomic_end: txEndingGenomic,
              };
              handleTxComponentResponse(txSegmentResponse, inputParams);
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
              const inputParams = {
                input_type: txInputType,
                input_tx: txAc,
                input_strand: txStrand,
                input_chr: txChrom,
                input_genomic_start: txStartingGenomic,
                input_genomic_end: txEndingGenomic,
              };
              handleTxComponentResponse(txSegmentResponse, inputParams);
            }
          });
        break;
      case 'exon_coords_tx':
        getTxSegmentComponentECT(
          txAc, startingExon as string, endingExon as string, startingExonOffset as string,
          endingExonOffset as string,
        )
          .then(txSegmentResponse => {
            if (txSegmentResponse.warnings?.length > 0) {
              const txWarning = `Unable to get exons for ${txAc}`;
              if (txSegmentResponse.warnings.includes(txWarning)) {
                setTxAcText('Unrecognized value');
              }
            } else {
              const inputParams = {
                input_type: txInputType,
                input_tx: txAc,
              };
              handleTxComponentResponse(txSegmentResponse, inputParams);
            }
          });
    }
  };

  const handleEnterKey = (e: KeyboardEvent) => {
    if ((e.key == 'Enter') && inputSuccessful) {
      setExpanded(false);
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
                onKeyDown={handleEnterKey}
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
                onKeyDown={handleEnterKey}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Ending Position"
                value={txEndingGenomic}
                onChange={(event) => setTxEndingGenomic(event.target.value)}
                onKeyDown={handleEnterKey}
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
                onKeyDown={handleEnterKey}
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
                onKeyDown={handleEnterKey}
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
                onKeyDown={handleEnterKey}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Ending Position"
                value={txEndingGenomic}
                onChange={(event) => setTxEndingGenomic(event.target.value)}
                onKeyDown={handleEnterKey}

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
                onKeyDown={handleEnterKey}
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
                onKeyDown={handleEnterKey}
              />
              <TextField
                margin="dense"
                style={{ width: 125 }}
                label="Ending Exon"
                value={endingExon}
                onChange={(event) => setEndingExon(event.target.value)}
                onKeyDown={handleEnterKey}
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
                  onKeyDown={handleEnterKey}
                />
                <TextField
                  margin="dense"
                  style={{ width: 125 }}
                  label="Ending Offset"
                  value={endingExonOffset}
                  onChange={(event) => setEndingExonOffset(event.target.value)}
                  onKeyDown={handleEnterKey}
                />
              </div>
              : null
            }
          </div>
        );
    }
  };

  return (
    <Accordion
      defaultExpanded={!inputSuccessful}
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {
            component.hr_name ?
              component.hr_name :
              '<incomplete>'
          }
        </Typography>
        {
          inputSuccessful ?
            <DoneIcon className='input-correct' style={{ color: green[500] }} /> :
            <ClearIcon className='input-incorrect' style={{ color: red[500] }} />
        }
        <DeleteIcon
          onClick={(event) => {
            event.stopPropagation();
            handleDelete(component.component_id);
          }
          }
          onFocus={(event) => event.stopPropagation()}
        />
      </AccordionSummary>
      <AccordionDetails>
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
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default TxSegmentCompInput;