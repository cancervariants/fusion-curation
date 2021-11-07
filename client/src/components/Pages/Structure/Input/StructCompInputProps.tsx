import {
  AnyGeneComponent, GeneComponent, LinkerComponent, TemplatedSequenceComponent,
  TranscriptSegmentComponent, UnknownGeneComponent
} from '../../../../services/ResponseModels';

export interface StructuralComponentInputProps {
  index: number,
  id: string,
  handleSave: (
    index: number, id: string, component: GeneComponent | LinkerComponent |
    TranscriptSegmentComponent | TemplatedSequenceComponent | AnyGeneComponent |
    UnknownGeneComponent,
    txInputType?: 'genomic_coords_gene' | 'genomic_coords_tx' | 'exon_coords_tx') => void;
  handleCancel: (id: string) => void;
  prevValues?: Object,
}