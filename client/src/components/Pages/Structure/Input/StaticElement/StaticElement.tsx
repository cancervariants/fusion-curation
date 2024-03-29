import { BaseStructuralElementProps } from "../StructuralElementInputProps";
import CompInputAccordion from "../StructuralElementInputAccordion";

const StaticElement: React.FC<BaseStructuralElementProps> = ({
  element,
  handleDelete,
  icon,
}) =>
  CompInputAccordion({
    expanded: false,
    element,
    handleDelete,
    validated: true,
    icon,
  });

export default StaticElement;
