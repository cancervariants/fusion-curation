import {
  Accordion, Typography, Tooltip, AccordionDetails, AccordionSummary
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import { red, green } from '@material-ui/core/colors';
import './CompInputAccordion.scss';
import { BaseComponentProps } from './StructCompInputProps';

interface CompInputAccordionProps extends BaseComponentProps {
  expanded: boolean,
  setExpanded?: React.Dispatch<React.SetStateAction<boolean>>,
  inputElements?: JSX.Element,
  validated: boolean,
}

const CompInputAccordion: React.FC<CompInputAccordionProps> = ({
  expanded, setExpanded, component, handleDelete, inputElements, validated
}) => (
  <Accordion
    defaultExpanded={!validated}
    expanded={expanded}
    onChange={() => setExpanded ? setExpanded(!expanded) : null}
    className="comp-input-accordion"
  >
    <AccordionSummary expandIcon={
      inputElements ?
        (<EditIcon className="edit-icon" style={{ fontSize: 23 }}/>) :
        null
    }>
      <div className="comp-bar">
        {
          validated ?
            <Tooltip title="Validation successful">
              <DoneIcon className='input-correct' style={{ color: green[500] }} />
            </Tooltip> :
            <Tooltip title="Invalid component">
              <ClearIcon className='input-incorrect' style={{ color: red[500] }} />
            </Tooltip>
        }
        <Typography>
          {
            component.hr_name ?
              component.hr_name :
              null
          }
        </Typography>
        <div>
          <Tooltip title="Delete component">
            <DeleteIcon
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(component.component_id);
              }}
              onFocus={(event) => event.stopPropagation()}
            />
          </Tooltip>
        </div>
      </div>
    </AccordionSummary>
    <AccordionDetails>
      <div className="card-parent">
        <div className="input-parent">
          {inputElements}
        </div>
      </div>
    </AccordionDetails>
  </Accordion>
);

export default CompInputAccordion;