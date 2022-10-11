import {
  Accordion,
  Typography,
  Tooltip,
  AccordionDetails,
  AccordionSummary,
  Box,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import DoneIcon from "@material-ui/icons/Done";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import { red, green } from "@material-ui/core/colors";
import "./StructuralElementInputAccordion.scss";
import { BaseStructuralElementProps } from "./StructuralElementInputProps";

interface StructuralElementInputAccordionProps
  extends BaseStructuralElementProps {
  expanded: boolean;
  setExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
  inputElements?: JSX.Element;
  validated: boolean;
  icon: JSX.Element;
}

const StructuralElementInputAccordion: React.FC<
  StructuralElementInputAccordionProps
> = ({
  expanded,
  setExpanded,
  element,
  handleDelete,
  inputElements,
  validated,
  icon,
}) => (
  <Accordion
    defaultExpanded={!validated}
    expanded={expanded}
    onChange={() => (setExpanded ? setExpanded(!expanded) : null)}
    className="comp-input-accordion"
  >
    <AccordionSummary
      expandIcon={
        inputElements ? (
          <EditIcon className="edit-icon" style={{ fontSize: 23 }} />
        ) : null
      }
    >
      <div className="comp-bar">
        <Box>
          {validated ? (
            <Tooltip title="Validation successful">
              <DoneIcon
                className="input-correct"
                style={{ color: green[500] }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Invalid component">
              <ClearIcon
                className="input-incorrect"
                style={{ color: red[500] }}
              />
            </Tooltip>
          )}
          {icon}
        </Box>
        <Typography>
          {element.nomenclature ? element.nomenclature : null}
        </Typography>
        <div>
          <Tooltip title="Delete element">
            <DeleteIcon
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(element.element_id);
              }}
              onFocus={(event) => event.stopPropagation()}
            />
          </Tooltip>
        </div>
      </div>
    </AccordionSummary>
    <AccordionDetails>
      <div className="card-parent">
        <div className="input-parent">{inputElements}</div>
      </div>
    </AccordionDetails>
  </Accordion>
);

export default StructuralElementInputAccordion;
