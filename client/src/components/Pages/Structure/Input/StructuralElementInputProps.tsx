import { ClientElementUnion } from "../../../../services/main";

export interface BaseStructuralElementProps {
  element: ClientElementUnion;
  handleDelete?: (id?: string) => void;
  icon: JSX.Element;
  pendingResponse?: boolean;
}

export interface StructuralElementInputProps
  extends BaseStructuralElementProps {
  index: number;
  handleSave: (element: ClientElementUnion) => void;
  icon: JSX.Element;
}
