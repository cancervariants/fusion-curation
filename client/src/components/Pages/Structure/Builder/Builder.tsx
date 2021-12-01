/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { ClientComponentUnion } from '../../../../services/main';
import {
  ClientAnyGeneComponent, ClientUnknownGeneComponent,
} from '../../../../services/ResponseModels';
import GeneCompInput from '../Input/GeneCompInput/GeneCompInput';
import LinkerCompInput from '../Input/LinkerCompInput/LinkerCompInput';
import StaticComponent from '../Input/StaticComponent/StaticComponent';
import TemplatedSequenceCompInput from
  '../Input/TemplatedSequenceCompInput/TemplatedSequenceCompInput';
import TxSegmentCompInput from '../Input/TxSegmentCompInput/TxSegmentCompInput';
import './Builder.scss';
// import { unstable_createMuiStrictModeTheme } from '@material-ui/core';

const EDITABLE_COMPONENT_TYPES = [
  'gene', 'linker_sequence', 'templated_sequence', 'transcript_segment'
];

// these are the empty object templates the user drags into the array
// TODO: should be dynamic
const OPTIONS = [
  {
    component_type: 'gene',
    component_name: '',
    component_id: uuid(),
    gene_descriptor: {
      id: '',
      type: '',
      gene_id: '',
      label: ''
    }
  },
  {
    component_type: 'transcript_segment',
    component_name: '',
    component_id: uuid(),
    exon_start: null,
    exon_start_offset: null,
    exon_end: null,
    exon_end_offset: null,
    gene_descriptor: {
      id: '',
      gene_id: '',
      type: '',
      label: ''
    }
  },
  {
    component_name: '',
    component_type: 'linker_sequence',
    component_id: uuid(),
  },
  {
    component_name: '',
    component_type: 'templated_sequence',
    component_id: uuid(),
    id: '',
    type: '',
    location: {
      sequence_id: '',
      type: '',
      interval: {
        start: {
          type: '',
          value: null
        },
        end: {
          type: '',
          value: null
        },
        type: ''
      }
    },
  },
  {
    component_name: '*',
    component_type: 'any_gene',
    component_id: uuid(),
    hr_name: '*',
  },
  {
    component_name: '?',
    component_type: 'unknown_gene',
    component_id: uuid(),
    hr_name: '?'
  }
];

const Builder: React.FC = () => {
  // Fusion object constructed throughout app lifecycle
  const { fusion, setFusion } = useContext(FusionContext);

  useEffect(() => {
    if (!('structural_components' in fusion)) {
      setFusion({
        ...fusion,
        ...{ 'structural_components': [] }
      });
    }
  }, [fusion]);

  // drop new component into structure
  const createNew = (result: DropResult) => {
    const { source, destination } = result;
    const sourceClone = Array.from(OPTIONS);
    const destClone = Array.from(fusion.structural_components);
    const item = sourceClone[source.index];
    const newItem = Object.assign({}, item);
    newItem.component_id = uuid();
    destClone.splice(destination.index, 0, newItem);
    setFusion({ ...fusion, ...{ 'structural_components': destClone } });

    // auto-save components that don't need any additional input
    // TODO shouldn't need explicit autosave
    if (['any_gene', 'unknown_gene'].includes(newItem.component_type)) {
      handleSave(
        destination.index, newItem as ClientAnyGeneComponent | ClientUnknownGeneComponent
      );
    }
  };

  const reorder = (result: DropResult) => {
    const { source, destination } = result;
    const sourceClone = Array.from(fusion.structural_components);
    const [movedComponent] = sourceClone.splice(source.index, 1);
    sourceClone.splice(destination.index, 0, movedComponent);
    setFusion({ ...fusion, ...{ 'structural_components': sourceClone } });
  };

  // Update global fusion object
  const handleSave = (index: number, newComponent: ClientComponentUnion) => {
    const items = Array.from(fusion.structural_components);
    const spliceLength = EDITABLE_COMPONENT_TYPES.includes(newComponent.component_type) ? 1 : 0;
    items.splice(index, spliceLength, newComponent);
    setFusion({ ...fusion, ...{ 'structural_components': items } });
  };

  const handleDelete = (uuid: string) => {
    let items: Array<ClientComponentUnion> = Array.from(fusion.structural_components);
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

  const renderComponent = (
    component: ClientComponentUnion, index: number,
  ) => {
    switch (component.component_type) {
      case 'gene':
        return (<GeneCompInput {...{ component, index, handleDelete, handleSave }} />);
      case 'linker_sequence':
        return (<LinkerCompInput {...{ component, index, handleDelete, handleSave }} />);
      case 'templated_sequence':
        return (<TemplatedSequenceCompInput {
          ...{ component, index, handleDelete, handleSave }
        } />);
      case 'transcript_segment':
        return (<TxSegmentCompInput {...{ component, index, handleDelete, handleSave }} />);
      case 'any_gene':
      case 'unknown_gene':
        return (<StaticComponent {...{ component, index, handleDelete }} />);
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
                <h2 className={
                  `${fusion.structural_components.length === 0 ? 'instruction' : 'hidden'}`
                }>
                  Drag components here
                </h2>
                {fusion.structural_components.map((
                  component: ClientComponentUnion, index: number
                ) => {
                  return (
                    <Draggable key={index} draggableId={component.component_id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef}
                          className={`block ${component.component_type}`}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {renderComponent(component, index)}
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
