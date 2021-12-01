import {
  Accordion, AccordionSummary, Typography, Card
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { BaseComponentProps } from '../StructCompInputProps';

const StaticComponent: React.FC<BaseComponentProps> = (
  { component, handleDelete }
) => (
  <Accordion>
    <AccordionSummary expandIcon={null}>
      <Typography>
        {component.hr_name}
      </Typography>
      <DeleteIcon
        onClick={(event) => {
          event.stopPropagation();
          handleDelete(component.component_id);
        }
        }
        onFocus={(event) => event.stopPropagation()}
      />
    </AccordionSummary>
  </Accordion>
);

export default StaticComponent;