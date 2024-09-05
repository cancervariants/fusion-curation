import { BaseStructuralElementProps } from "../StructuralElementInputProps";
import StructuralElementInputAccordion from "../StructuralElementInputAccordion";

const StaticElement: React.FC<BaseStructuralElementProps> = ({
  element,
  handleDelete,
  icon,
}) =>
  StructuralElementInputAccordion({
    expanded: false,
    element,
    handleDelete,
    validated: true,
    icon,
    pendingResponse: false,
  });

export default StaticElement;
