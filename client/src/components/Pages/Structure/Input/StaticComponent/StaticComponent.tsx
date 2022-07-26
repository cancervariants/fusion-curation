import { BaseComponentProps } from '../StructCompInputProps';
import CompInputAccordion from '../CompInputAccordion';

const StaticComponent: React.FC<BaseComponentProps> = (
  { component, handleDelete }
) => CompInputAccordion({
  expanded: false,
  component,
  handleDelete,
  validated: true
});

export default StaticComponent;