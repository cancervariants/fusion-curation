import React, { useState, useEffect, KeyboardEvent } from 'react';
import {
  TextField, Accordion, AccordionDetails, AccordionSummary, Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import { red, green } from '@material-ui/core/colors';
import { StructuralComponentInputProps } from '../StructCompInputProps';
import { getTemplatedSequenceComponent } from '../../../../../services/main';
import {
  ClientTemplatedSequenceComponent, Number, SequenceLocation
} from '../../../../../services/ResponseModels';

interface TemplatedSequenceComponentInputProps extends StructuralComponentInputProps {
  component: ClientTemplatedSequenceComponent;
}

const TemplatedSequenceCompInput: React.FC<TemplatedSequenceComponentInputProps> = (
  { component, index, handleSave, handleDelete }
) => {
  const [chromosome, setChromosome] = useState<string>(component.input_chromosome || '');
  const [strand, setStrand] = useState<string>(component.strand || '');
  const [startPosition, setStartPosition] = useState<string>(component.input_start || '');
  const [endPosition, setEndPosition] = useState<string>(component.input_end || '');
  const [inputError, setInputError] = useState<string>('');

  const inputComplete = (
    (chromosome !== '') && (strand !== '') && (startPosition !== '') && (endPosition !== '')
  );
  const inputSuccessful = inputComplete && (inputError === '');

  const [expanded, setExpanded] = useState<boolean>(!inputSuccessful);

  useEffect(() => {
    if (inputComplete) {
      buildTemplatedSequenceComponent();
    }
  }, [chromosome, strand, startPosition, endPosition]
  );

  const handleEnterKey = (e: KeyboardEvent) => {
    if ((e.key == 'Enter') && inputSuccessful) {
      setExpanded(false);
    }
  };

  const buildTemplatedSequenceComponent = () => {
    getTemplatedSequenceComponent(chromosome, strand, startPosition, endPosition)
      .then(templatedSequenceResponse => {
        if (templatedSequenceResponse.warnings?.length > 0) {
          // TODO visible error handling
          setInputError('component validation unsuccessful');
          return;
        } else {
          setInputError('');
          // update hr_name, component_name
          const location = templatedSequenceResponse.component.region.location as SequenceLocation;
          const sequence = location.sequence_id.split(':')[1];
          // eslint-disable-next-line @typescript-eslint/ban-types
          const start = location.interval.start as Number;
          // eslint-disable-next-line @typescript-eslint/ban-types
          const end = location.interval.end as Number;
          const name = `${sequence}:g.${start.value}_${end.value}(${strand})`;

          const templatedSequenceComponent: ClientTemplatedSequenceComponent = {
            ...templatedSequenceResponse.component,
            component_id: component.component_id,
            component_name: name,
            hr_name: name,
            input_chromosome: chromosome,
            input_start: startPosition,
            input_end: endPosition,
          };
          handleSave(index, templatedSequenceComponent);
        }
      });
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
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                label="Chromosome"
                value={chromosome}
                onChange={(event) => setChromosome(event.target.value)}
                onKeyDown={handleEnterKey}
              />
              <TextField
                margin="dense"
                style={{ height: 38, width: 125 }}
                label="Strand"
                value={strand}
                onChange={(event) => setStrand(event.target.value)}
                onKeyDown={handleEnterKey}
              />
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
          </div>
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default TemplatedSequenceCompInput;