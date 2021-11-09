/* eslint-disable @typescript-eslint/no-unused-vars */
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import React, { useContext, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import {
  AnyGeneComponent, ClientAnyGeneComponent, ClientGeneComponent,
  ClientLinkerComponent, ClientTemplatedSequenceComponent, ClientTranscriptSegmentComponent,
  ClientUnknownGeneComponent, GeneComponent, LinkerComponent, TemplatedSequenceComponent,
  TranscriptSegmentComponent, UnknownGeneComponent
} from '../../../../services/ResponseModels';
import GeneCompInput from '../Input/GeneCompInput/GeneCompInput';
import LinkerCompInput from '../Input/LinkerCompInput/LinkerCompInput';
import TemplatedSequenceCompInput
  from '../Input/TemplatedSequenceCompInput/TemplatedSequenceCompInput';
import TxSegmentCompInput from '../Input/TxSegmentCompInput/TxSegmentCompInput';
import './Builder.scss';
// import { unstable_createMuiStrictModeTheme } from '@material-ui/core';

type ClientComponentUnion = ClientAnyGeneComponent | ClientGeneComponent | ClientLinkerComponent |
  ClientTemplatedSequenceComponent | ClientTranscriptSegmentComponent | ClientUnknownGeneComponent;

const EDITABLE_COMPONENT_TYPES = [
  'gene', 'linker_sequence', 'templated_sequence', 'transcript_segment'
];

// these are the empty object templates the user drags into the array
// TODO: should be dynamic
const OPTIONS = [
  {
    'component_type': 'gene',
    'component_name': '',
    'component_id': uuid(),
    'gene_descriptor': {
      'id': '',
      'type': '',
      'gene_id': '',
      'label': ''
    }
  },
  {
    'component_type': 'transcript_segment',
    'component_name': '',
    'component_id': uuid(),
    'exon_start': null,
    'exon_start_offset': null,
    'exon_end': null,
    'exon_end_offset': null,
    'gene_descriptor': {
      'id': '',
      'gene_id': '',
      'type': '',
      'label': ''
    }
  },
  {
    'component_name': '',
    'component_type': 'linker_sequence',
    'component_id': uuid(),
  },
  {
    'component_name': '',
    'component_type': 'templated_sequence',
    'component_id': uuid(),
    'id': '',
    'type': '',
    'location': {
      'sequence_id': '',
      'type': '',
      'interval': {
        'start': {
          'type': '',
          'value': null
        },
        'end': {
          'type': '',
          'value': null
        },
        'type': ''
      }
    },
  },
  {
    component_name: '',
    component_type: 'any_gene',
    component_id: uuid(),
    hr_name: '',
  },
  {
    component_name: '',
    component_type: 'unknown_gene',
    component_id: uuid(),
    hr_name: ''
  }
];

const Builder: React.FC = () => {
  // Fusion object constructed throughout app lifecycle
  const { fusion, setFusion } = useContext(FusionContext);
  // displayed structural elements
  const [structure, setStructure] = useState([]);
  // load input interface instead of completed component element for these UUIDs
  const [editMode, setEditMode] = useState([]);

  useEffect(() => {
    if ('structural_components' in fusion) {
      setStructure(Array.from(fusion.structural_components));
    } else {
      setStructure([]);
    }
  }, [fusion]);
  console.log(structure);

  // drop new component into structure
  const createNew = (result: DropResult) => {
    const { source, destination } = result;
    const sourceClone = Array.from(OPTIONS);
    const destClone = Array.from(structure);
    const item = sourceClone[source.index];
    const newItem = Object.assign({}, item);
    newItem.component_id = uuid();
    destClone.splice(destination.index, 0, newItem);
    setStructure(destClone);

    // auto-save components that don't need any additional input
    if (newItem.component_type === 'any_gene') {
      handleSave(destination.index, newItem.component_id, {
        component_type: 'any_gene',
      });
    } else if (newItem.component_type === 'unknown_gene') {
      handleSave(destination.index, newItem.component_id, {
        component_type: 'unknown_gene',
      });
    } else {
      const newEditMode = editMode;
      newEditMode.push(newItem.component_id);
      setEditMode(newEditMode);
    }
  };

  const reorder = (result: DropResult) => {
    const { source, destination } = result;
    const sourceClone = Array.from(structure);
    const [movedComponent] = sourceClone.splice(source.index, 1);
    sourceClone.splice(destination.index, 0, movedComponent);
    setFusion({ ...fusion, ...{ 'structural_components': sourceClone } });
  };

  // build client-oriented component given complete component (i.e. add uuid, names, etc)
  const handleSave = (
    index: number, id: string, component: GeneComponent | LinkerComponent |
      TranscriptSegmentComponent | TemplatedSequenceComponent | AnyGeneComponent |
      UnknownGeneComponent,
    txInputType?: 'genomic_coords_gene' | 'genomic_coords_tx' | 'exon_coords_tx'
  ) => {
    // TODO: prevent from sending empty fields (where applicable)

    switch (component.component_type) {
      case 'gene':
        const descriptor = component.gene_descriptor;
        const nomenclature =
          `${descriptor.label}(${descriptor.gene_id})`;
        const geneComponent: ClientGeneComponent = {
          ...component,
          component_id: id,
          component_name: nomenclature,
          hr_name: nomenclature,
        };
        saveComponent(index, geneComponent);
        break;
      case 'transcript_segment':
        const { exon_start, exon_start_offset, exon_end, exon_end_offset } = component;
        const txAc = component.transcript;
        const txGeneDescriptor = component.gene_descriptor;
        const txGeneSymbol = txGeneDescriptor.label;
        let eso: string;
        if (exon_start_offset > 0) {
          eso = `+${exon_start_offset}`;
        } else if (exon_start_offset < 0) {
          eso = `${exon_start_offset}`;
        } else {
          eso = '';
        }

        let eeo: string;
        if (exon_end_offset > 0) {
          eeo = `+${exon_end_offset}`;
        } else if (exon_end_offset < 0) {
          eeo = `${exon_end_offset}`;
        } else {
          eeo = '';
        }

        let hrExon: string;
        if (exon_start && exon_end) {
          hrExon = `e.${exon_start}${eso}_${exon_end}${eeo}`;
        } else if (exon_start) {
          hrExon = `e.${exon_start}${eso}_`;
        } else {
          hrExon = `e._${exon_end}${eeo}`;
        }

        const txAcName = txAc.split(':')[1];

        const txComponent: ClientTranscriptSegmentComponent = {
          ...component,
          component_id: id,
          component_name: `${txAcName} ${txGeneSymbol}`,
          hr_name: `${txAcName}(${txGeneSymbol}):${hrExon}`,
          shorthand: txAcName,
          input_type: txInputType,
        };
        saveComponent(index, txComponent);
        break;
      case 'templated_sequence':
        if (
          component.region.location.type !== 'SequenceLocation'
          || component.region.location.interval.type !== 'SequenceInterval'
          || component.region.location.interval.start.type !== 'Number'
          || component.region.location.interval.end.type !== 'Number'
        ) {
          // TODO error
          return;
        }
        const sequence = component.region.location.sequence_id.split(':')[1];
        const name = `${sequence}:` +
          `g.${component.region.location.interval.start.value}_` +
          `${component.region.location.interval.end.value}(${component.strand})`;
        const templatedSequenceComponent: ClientTemplatedSequenceComponent = {
          ...component,
          component_id: id,
          component_name: name,
          hr_name: name,
        };
        saveComponent(index, templatedSequenceComponent);
        break;
      case 'linker_sequence':
        const linkerComponent: ClientLinkerComponent = {
          ...component,
          component_id: id,
          component_name: component.linker_sequence.sequence,
          hr_name: component.linker_sequence.sequence,
        };
        saveComponent(index, linkerComponent);
        break;
      case 'any_gene':
        const anyGeneComponent: ClientAnyGeneComponent = {
          ...component,
          component_id: id,
          component_name: '*',
          hr_name: '*'
        };
        saveComponent(index, anyGeneComponent);
        break;
      case 'unknown_gene':
        const unknownGeneComponent: ClientUnknownGeneComponent = {
          ...component,
          component_id: id,
          component_name: '?',
          hr_name: '?'
        };
        saveComponent(index, unknownGeneComponent);
        break;
    }
  };

  // clear active state, update local state array, update global fusion object
  const saveComponent = (index: number, newObj: ClientComponentUnion) => {
    const items = Array.from(structure);
    const spliceLength = EDITABLE_COMPONENT_TYPES.includes(newObj.component_type) ? 1 : 0;
    items.splice(index, spliceLength, newObj);

    const newEditMode = [...editMode];
    newEditMode.splice(newEditMode.indexOf(newObj.component_id), 1);
    setEditMode(newEditMode);

    setFusion({ ...fusion, ...{ 'structural_components': items } });
  };

  const handleCancel = (id: string) => {
    const items = Array.from(structure).filter(item => item.component_id !== id);
    const newEditMode = editMode;
    newEditMode.splice(newEditMode.indexOf(id), 1);
    setEditMode(newEditMode);
    setStructure(items);
  };

  // turn on edit mode for component
  const handleEdit = (component_id: string) => {
    const newEditMode = [...editMode];
    newEditMode.push(component_id);
    setEditMode(newEditMode);
  };

  const handleDelete = (uuid: string) => {
    let items = Array.from(structure);
    items = items.filter(item => item.component_id !== uuid);
    setFusion({ ...fusion, ...{ 'structural_components': items } });
  };

  const formatType = (str: string) => {
    switch (str) {
      case 'gene':
        return 'Gene';
      case 'transcript_segment':
        return 'Transcript Segment';
      case 'linker_sequence':
        return 'Linker Sequence';
      case 'templated_sequence':
        return 'Templated Sequence';
      case 'any_gene':
        return 'Any Gene';
      case 'unknown_gene':
        return 'Unknown Gene';
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return; // dropped outside the list
    if (destination.droppableId === source.droppableId) {
      reorder(result);
    } else {
      createNew(result);
    }
  };

  const renderInput = (
    id: string, index: number, compType: string,
  ) => {
    switch (compType) {
      case 'gene':
        return (<GeneCompInput {...{ index, id, handleCancel, handleSave }} />);
      case 'templated_sequence':
        return (<TemplatedSequenceCompInput {...{ index, id, handleCancel, handleSave }} />);
      case 'transcript_segment':
        return (<TxSegmentCompInput {...{ index, id, handleCancel, handleSave }} />);
      case 'linker_sequence':
        return (<LinkerCompInput {...{ index, id, handleCancel, handleSave }} />);
    }
  };

  return (
    <div className='builder'>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='OPTIONS' isDropDisabled={true}>
          {(provided, snapshot) => (
            <div className='options'
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className='options-container'>
                {OPTIONS.map(({ component_id, component_type }, index) => (
                  <Draggable
                    key={component_id}
                    draggableId={component_id}
                    index={index}
                  >
                    {(provided, snapshot) => {
                      // crude way of cancelling when user has an unsaved component
                      // TODO
                      if (snapshot.isDragging && editMode.length > 0) {
                        handleCancel(editMode[0]);
                      }
                      return (<React.Fragment>
                        <div
                          ref={provided.innerRef}
                          className={`option-item ${component_type}`}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            transform: snapshot.isDragging
                              ? provided.draggableProps.style?.transform
                              : 'translate(0px, 0px)',
                          }}
                        >
                          {formatType(component_type)}
                        </div>
                        {snapshot.isDragging && (
                          <div
                            style={{ transform: 'none !important' }}
                            key={component_id}
                            className={`option-item clone ${component_type}`}
                          >
                            {formatType(component_type)}
                          </div>
                        )}
                      </React.Fragment>);
                    }}
                  </Draggable>
                ))}
              </div>
            </div>
          )}
        </Droppable>
        <div className='right-side'>
          <Droppable droppableId='structure'>
            {(provided, snapshot) => (
              <div className='block-container' {...provided.droppableProps} ref={provided.innerRef}>
                <h2 className={`${structure.length === 0 ? 'instruction' : 'hidden'}`}>
                  Drag components here
                </h2>
                {structure.map(({ component_id, hr_name, component_type }, index) => {
                  return (
                    <Draggable key={index} draggableId={component_id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef}
                          className={`block ${component_type}`}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {
                            editMode.includes(component_id) ?
                              renderInput(component_id, index, component_type)
                              : <div className="comp-input">
                                <div className="hr-name">
                                  {hr_name}
                                </div>
                                {
                                  EDITABLE_COMPONENT_TYPES.includes(component_type) ?
                                    <EditIcon
                                      className="button-edit"
                                      onClick={() => handleEdit(component_id)}
                                    />
                                    :
                                    <EditIcon
                                      className="button-edit-disabled"
                                      color="disabled"
                                    />
                                }
                                <DeleteIcon
                                  className="button-trash"
                                  onClick={() => handleDelete(component_id)}
                                />
                              </div>
                          }
                        </div>
                      )}
                    </Draggable>
                  );
                })}
              </div>
            )}
          </Droppable>
          <div className='hr-section'>
            {
              fusion.structural_components?.filter(
                (comp: ClientComponentUnion) => Boolean(comp) && comp.hr_name
              ).map((comp: ClientComponentUnion, index: number) => (
                <div key={comp.component_id}>{`${index ? '::' : ''}${comp.hr_name}`}</div>
              ))
            }
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default Builder;
