import {
  AnyGeneComponent, GeneComponent, LinkerComponent, TemplatedSequenceComponent,
  TranscriptSegmentComponent, UnknownGeneComponent
} from '../../../../services/ResponseModels';

export interface StructuralComponentInputProps {
  index: number,
  id: string,
  handleSave: (
    index: number, component: GeneComponent | LinkerComponent | TranscriptSegmentComponent |
    TemplatedSequenceComponent | AnyGeneComponent | UnknownGeneComponent) => void;
  handleCancel: (id: string) => void;
}