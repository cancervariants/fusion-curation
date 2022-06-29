import {
  TextField, MenuItem, FormLabel, Select, RadioGroup, FormControlLabel, Radio,
} from '@material-ui/core';
import {
  ClientTranscriptSegmentElement, TranscriptSegmentElement, TxSegmentElementResponse
} from '../../../../../services/ResponseModels';
import { useEffect, useState, KeyboardEvent } from 'react';
import {
  getTxSegmentElementECT, getTxSegmentElementGCG, getTxSegmentElementGCT
} from '../../../../../services/main';
import { GeneAutocomplete } from '../../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { StructuralElementInputProps } from '../StructuralElementInputProps';
import CompInputAccordion from '../StructuralElementInputAccordion';

interface TxSegmentElementInputProps extends StructuralElementInputProps {
  element: ClientTranscriptSegmentElement;
}

const TxSegmentCompInput: React.FC<TxSegmentElementInputProps> = (
  { element, index, handleSave, handleDelete }
) => {
  const [txInputType, setTxInputType] = useState(element.input_type || 'default');

  const [txAc, setTxAc] = useState(element.input_tx || '');
  const [txAcText, setTxAcText] = useState('');

  const [txGene, setTxGene] = useState(element.input_gene || '');
  const [txGeneText, setTxGeneText] = useState('');

  const [txStrand, setTxStrand] = useState(element.input_strand || 'default');

  const [txChrom, setTxChrom] = useState(element.input_chr || '');
  const [txChromText, setTxChromText] = useState('');

  const [txStartingGenomic, setTxStartingGenomic] = useState(element.input_genomic_start || '');
  const [txStartingGenomicText, setTxStartingGenomicText] = useState('');
  const [txEndingGenomic, setTxEndingGenomic] = useState(element.input_genomic_end || '');
  const [txEndingGenomicText, setTxEndingGenomicText] = useState('');

  const [startingExon, setStartingExon] = useState(element.exon_start || '');
  const [endingExon, setEndingExon] = useState(element.exon_end || '');
  const [startingExonOffset, setStartingExonOffset] = useState(element.exon_start_offset || '');
  const [endingExonOffset, setEndingExonOffset] = useState(element.exon_end_offset || '');

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

  const validated = inputComplete && (txGeneText === '') && (txChromText === '') &&
    (txAcText === '');

  const [expanded, setExpanded] = useState<boolean>(!validated);

  useEffect(() => {
    if (inputComplete) {
      buildTranscriptSegmentElement();
    }
  }, [
    txAc, txGene, txStrand, txChrom, txStartingGenomic, txEndingGenomic, startingExon,
    endingExon, startingExonOffset, endingExonOffset
  ]);

  const handleTxElementResponse = (
    txSegmentResponse: TxSegmentElementResponse, inputParams: Record<string, string>,
  ) => {
    const responseElement = txSegmentResponse.element as TranscriptSegmentElement;
    const finishedElement: ClientTranscriptSegmentElement = {
      ...element,
      ...responseElement,
      ...inputParams,
    };

    let eso: string;
    if (finishedElement.exon_start_offset > 0) {
      eso = `+${finishedElement.exon_start_offset}`;
    } else if (finishedElement.exon_start_offset < 0) {
      eso = `${finishedElement.exon_start_offset}`;
    } else {
      eso = '';
    }

    let eeo: string;
    if (finishedElement.exon_end_offset > 0) {
      eeo = `+${finishedElement.exon_end_offset}`;
    } else if (finishedElement.exon_end_offset < 0) {
      eeo = `${finishedElement.exon_end_offset}`;
    } else {
      eeo = '';
    }

    let hrExon: string;
    if (finishedElement.exon_start && finishedElement.exon_end) {
      hrExon = `e.${finishedElement.exon_start}${eso}_${finishedElement.exon_end}${eeo}`;
    } else if (finishedElement.exon_start) {
      hrExon = `e.${finishedElement.exon_start}${eso}_`;
    } else {
      hrExon = `e._${finishedElement.exon_end}${eeo}`;
    }

    const responseGeneSymbol = finishedElement.gene_descriptor.label;
    const txAcName = finishedElement.transcript.split(':')[1];

    finishedElement.element_name = `${txAcName} ${responseGeneSymbol}`;
    finishedElement.hr_name = `${txAcName}(${responseGeneSymbol}):${hrExon}`;
    handleSave(index, finishedElement);
  };

  const buildTranscriptSegmentElement = () => {
    switch (txInputType) {
      case 'genomic_coords_gene':
        getTxSegmentElementGCG(txGene, txChrom, txStartingGenomic, txEndingGenomic, txStrand)
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
              handleTxElementResponse(txSegmentResponse, inputParams);
            }
          });
        break;
      case 'genomic_coords_tx':
        getTxSegmentElementGCT(txAc, txChrom, txStartingGenomic, txEndingGenomic, txStrand)
          .then(txSegmentResponse => {
            if (txSegmentResponse.warnings?.length > 0) {
              // TODO more warnings
              const chromWarning = `Invalid chromosome: ${txChrom}`;
              if (txSegmentResponse.warnings.includes(chromWarning)) {
                setTxChromText('Unrecognized value');
              }
              const startWarning = `Unable to find a result for chromosome ${txChrom} where ` +
                `genomic coordinate ${txStartingGenomic} is mapped between an exon's start ` +
                `and end coordinates + on the ${txStrand === '+' ? 'positive' : 'negative'}`;
              if (txSegmentResponse.warnings.includes(startWarning)) {
                // TODO set starting warning
              }
              // TODO set ending warning
              // also TODO make sure to unset where needed
            } else {
              const inputParams = {
                input_type: txInputType,
                input_tx: txAc,
                input_strand: txStrand,
                input_chr: txChrom,
                input_genomic_start: txStartingGenomic,
                input_genomic_end: txEndingGenomic,
              };
              handleTxElementResponse(txSegmentResponse, inputParams);
            }
          });
        break;
      case 'exon_coords_tx':
        getTxSegmentElementECT(
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
              handleTxElementResponse(txSegmentResponse, inputParams);
            }
          });
    }
  };

  const handleEnterKey = (e: KeyboardEvent) => {
    if ((e.key == 'Enter') && validated) {
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

  const inputElements = (
    <>
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
    </>
  );

  return CompInputAccordion({
    expanded, setExpanded, element, handleDelete, inputElements, validated
  });
};

export default TxSegmentCompInput;