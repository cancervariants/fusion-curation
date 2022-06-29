import React, { useState, useEffect, KeyboardEvent } from 'react';
import {
  TextField, RadioGroup, FormLabel, FormControlLabel, Radio
} from '@material-ui/core';
import { StructuralElementInputProps } from '../StructuralElementInputProps';
import { getTemplatedSequenceElement } from '../../../../../services/main';
import {
  ClientTemplatedSequenceElement, Number as VrsNumber, SequenceLocation
} from '../../../../../services/ResponseModels';
import StructuralElementInputAccordion from '../StructuralElementInputAccordion';

interface TemplatedSequenceElementInputProps extends StructuralElementInputProps {
  element: ClientTemplatedSequenceElement;
}

const TemplatedSequenceElementInput: React.FC<TemplatedSequenceElementInputProps> = (
  { element, index, handleSave, handleDelete }
) => {
  const [chromosome, setChromosome] = useState<string>(element.input_chromosome || '');
  const [strand, setStrand] = useState<string>(element.strand || '');
  const [startPosition, setStartPosition] = useState<string>(element.input_start || '');
  const [endPosition, setEndPosition] = useState<string>(element.input_end || '');
  const [inputError, setInputError] = useState<string>('');

  const inputComplete = (
    (chromosome !== '') && (strand !== '') && (startPosition !== '') && (endPosition !== '')
  );
  const validated = inputComplete && (inputError === '');

  const [expanded, setExpanded] = useState<boolean>(!validated);

  useEffect(() => {
    if (inputComplete) {
      buildTemplatedSequenceElement();
    }
  }, [chromosome, strand, startPosition, endPosition]
  );

  const handleEnterKey = (e: KeyboardEvent) => {
    if ((e.key == 'Enter') && validated) {
      setExpanded(false);
    }
  };

  const buildTemplatedSequenceElement = () => {
    getTemplatedSequenceElement(chromosome, strand, startPosition, endPosition)
      .then(templatedSequenceResponse => {
        if (templatedSequenceResponse.warnings?.length > 0) {
          // TODO visible error handling
          setInputError('element validation unsuccessful');
          return;
        } else {
          setInputError('');
          const location = templatedSequenceResponse.element.region.location as SequenceLocation;
          const sequence = location.sequence_id.split(':')[1];
          const start = location.interval.start as VrsNumber;
          const end = location.interval.end as VrsNumber;
          const name = `${sequence}:g.${start.value}_${end.value}(${strand})`;

          const templatedSequenceElement: ClientTemplatedSequenceElement = {
            ...templatedSequenceResponse.element,
            element_id: element.element_id,
            element_name: name,
            hr_name: name,
            input_chromosome: chromosome,
            input_start: startPosition,
            input_end: endPosition,
          };
          handleSave(index, templatedSequenceElement);
        }
      });
  };

  const inputElements = (
    <>
      <div className="top-inputs">
        <TextField
          margin="dense"
          style={{ height: 38, width: 125 }}
          label="Chromosome"
          value={chromosome}
          onChange={(event) => setChromosome(event.target.value)}
          onKeyDown={handleEnterKey}
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
          style={{ height: 38, width: 125 }}
          label="Start Position"
          value={startPosition}
          onChange={(event) => setStartPosition(event.target.value)}
          onKeyDown={handleEnterKey}
        />
        <TextField
          margin="dense"
          style={{ height: 38, width: 125 }}
          label="End Position"
          value={endPosition}
          onChange={(event) => setEndPosition(event.target.value)}
          onKeyDown={handleEnterKey}
        />
      </div>
    </>
  );

  return StructuralElementInputAccordion({
    expanded, setExpanded, element, handleDelete, inputElements, validated
  });
};

export default TemplatedSequenceElementInput;