import {
  Accordion, AccordionSummary, Typography, TextField, AccordionDetails
} from '@material-ui/core';
import { useEffect, useState } from 'react';
import { ClientLinkerComponent } from '../../../../../services/ResponseModels';
import { StructuralComponentInputProps } from '../StructCompInputProps';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import { red, green } from '@material-ui/core/colors';

interface LinkerComponentInputProps extends StructuralComponentInputProps {
  component: ClientLinkerComponent;
}

const LinkerCompInput: React.FC<LinkerComponentInputProps> = (
  { component, index, handleSave, handleDelete }
) => {
  // Linker Sequence
  const [sequence, setSequence] = useState<string>(component.linker_sequence?.sequence || '');
  const linkerError = Boolean(sequence) && sequence.match(/^([aAgGtTcC]+)?$/) === null;
  const [expanded, setExpanded] = useState<boolean>(linkerError);

  useEffect(() => {
    if (!linkerError) buildLinkerComponent();
  }, [sequence]);

  const buildLinkerComponent = () => {
    const linkerComponent: ClientLinkerComponent = {
      ...component,
      linker_sequence: {
        id: `fusor.sequence:${sequence}`,
        type: 'SequenceDescriptor',
        sequence: sequence,
        residue_type: 'SO:0000348'
      },
      component_name: sequence,
      hr_name: sequence,
    };
    handleSave(index, linkerComponent);
  };

  return (
    <Accordion
      defaultExpanded={!linkerError}
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {
            sequence ?
              sequence :
              '<incomplete>'
          }
        </Typography>
        {
          (!linkerError && sequence) ?
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
        <TextField
          margin="dense"
          label="Sequence"
          value={sequence}
          onChange={(event) => setSequence(event.target.value.toUpperCase())}
          error={linkerError}
          helperText={
            linkerError ? 'Only {A, C, G, T} permitted' : null
          }
          onKeyDown={(e) => {
            if ((e.key === 'Enter') && (!linkerError)) {
              setExpanded(false);
            }
          }}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default LinkerCompInput;