import { BaseStructuralElementProps } from '../StructuralElementInputProps';
import CompInputAccordion from '../StructuralElementInputAccordion';

const StaticElement: React.FC<BaseStructuralElementProps> = (
  { element, handleDelete }
) => CompInputAccordion({
  expanded: false,
  element,
  handleDelete,
  validated: true
});

export default StaticElement;