import { ClientComponentUnion } from '../../../../services/main';

export interface BaseComponentProps {
  component: ClientComponentUnion;
  handleDelete: (id: string) => void;
}

export interface StructuralComponentInputProps extends BaseComponentProps {
  index: number;
  handleSave: (index: number, component: ClientComponentUnion) => void;
}