import { TextField } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { ClientLinkerComponent } from '../../../../../services/ResponseModels';
import { StructuralComponentInputProps } from '../StructCompInputProps';
import CompInputAccordion from '../CompInputAccordion';

interface LinkerComponentInputProps extends StructuralComponentInputProps {
  component: ClientLinkerComponent;
}

const LinkerCompInput: React.FC<LinkerComponentInputProps> = (
  { component, index, handleSave, handleDelete }
) => {
  // bases
  const [sequence, setSequence] = useState<string>(component.linker_sequence?.sequence || '');
  const linkerError = Boolean(sequence) && sequence.match(/^([aAgGtTcC]+)?$/) === null;
  const validated = Boolean(sequence && (!linkerError));
  const [expanded, setExpanded] = useState<boolean>(!validated);

  useEffect(() => {
    if (validated) buildLinkerComponent();
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

  const inputElements = (
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
  );

  return CompInputAccordion({
    expanded, setExpanded, component, handleDelete, inputElements, validated
  });
};

export default LinkerCompInput;