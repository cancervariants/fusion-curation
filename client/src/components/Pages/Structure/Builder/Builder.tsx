import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { DomainOptionsContext } from '../../../../global/contexts/DomainOptionsContext';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import './Builder.scss';
import { TransCompInput } from '../TransCompInput/TransCompInput';
import { getAssociatedDomains } from '../../../../services/main';
import {
  ClientGeneComponent, ClientLinkerComponent, ClientTemplatedSequenceComponent,
  ClientTranscriptSegmentComponent, GeneComponent, LinkerComponent, TemplatedSequenceComponent,
  TranscriptSegmentComponent
} from '../../../../services/ResponseModels';
import ButtonTrash from '../../../main/shared/Buttons/ButtonTrash';
// import { unstable_createMuiStrictModeTheme } from '@material-ui/core';

interface Props {
  transcriptComponents
}

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
    // need an example linker structure
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
    }
  },
];

const Builder: React.FC<Props> = ({ transcriptComponents }) => {
  // Fusion object constructed throughout app lifecycle
  const { fusion, setFusion } = useContext(FusionContext);
  // Choosable domains based on genes provided in components
  const { domainOptions, setDomainOptions } = useContext(DomainOptionsContext);
  // displayed structural elements
  const [structure, setStructure] = useState([]);

  const [editMode, setEditMode] = useState('');

  useEffect(() => {
    const diagram = [];
    if ('transcript_components' in fusion) {
      fusion.transcript_components.map(comp => (
        diagram.push(comp)
      ));
      setStructure(diagram);
    }
  }, [transcriptComponents]);

  const copy = (result: DropResult) => {
    const { source, destination } = result;
    const sourceClone = Array.from(OPTIONS);
    const destClone = Array.from(structure);
    const item = sourceClone[source.index];
    const newItem = Object.assign({}, item);
    newItem.component_id = uuid();
    destClone.splice(destination.index, 0, newItem);
    setStructure(destClone);
    setEditMode(newItem.component_id);
  };

  const reorder = (result: DropResult) => {
    // no dragging until done editing. the isDragDisabled prop is preferable for this,
    // but it seems to impede seamless dragging even when false.
    if (editMode !== '') {
      return;
    }

    const { source, destination } = result;

    const sourceClone = Array.from(structure);
    const [newOrder] = sourceClone.splice(source.index, 1);
    sourceClone.splice(destination.index, 0, newOrder);

    setFusion({ ...fusion, ...{ 'transcript_components': sourceClone } });
    setStructure(sourceClone);
  };

  const handleSave = (
    index: number, component: GeneComponent | LinkerComponent | TranscriptSegmentComponent |
    TemplatedSequenceComponent
  ) => {
    // TODO: prevent from sending empty fields (where applicable)
    const items = Array.from(structure);

    switch (component.component_type) {
      case 'gene':
        const descriptor = component.gene_descriptor;
        const nomenclature =
          `${descriptor.label}(${descriptor.gene_id})`;
        const geneComponent: ClientGeneComponent = {
          ...component,
          component_id: uuid(),
          component_name: nomenclature,
          hr_name: nomenclature,
        };
        updateDomainOptions(descriptor.gene_id, descriptor.label);
        saveComponent(items, index, geneComponent);
        break;
      case 'transcript_segment':
        const { exon_start, exon_start_offset, exon_end, exon_end_offset } = component;
        const tx_ac = component.transcript;
        const tx_descriptor = component.gene_descriptor;
        const tx_gene = tx_descriptor.label;
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
          hrExon = `e[${exon_start}${eso}_${exon_end}${eeo}]`;
        } else if (exon_start) {
          hrExon = `e[${exon_start}${eso}_]`;
        } else {
          hrExon = `e[_${exon_end}${eeo}]`;
        }

        const txComponent: ClientTranscriptSegmentComponent = {
          ...component,
          component_id: uuid(),
          component_name: `${tx_ac} ${tx_gene}`,
          hr_name: `${tx_ac}(${tx_gene}):${hrExon}`,
          shorthand: tx_ac,
        };
        updateDomainOptions(tx_descriptor.gene_id, tx_descriptor.label);
        saveComponent(items, index, txComponent);
        break;

        //TODO: nested genomic region (lookup GR based on transcript and vice versa)
        // getSequenceId(chr).then(sequenceResponse => {
        //   let [sequence, sequence_id, warnings] = sequenceResponse;
        // })
        // });

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
        const name = `chr${component.region.location.sequence_id.split(':')[1]}:` +
          `${component.region.location.interval.start.value}_` +
          `${component.region.location.interval.end.value}(${component.strand})`;
        const templatedSequenceComponent: ClientTemplatedSequenceComponent = {
          ...component,
          component_id: uuid(),
          component_name: name,
          hr_name: name,
        };
        saveComponent(items, index, templatedSequenceComponent);
        console.log(component);
        break;
      case 'linker_sequence':
        const linkerComponent: ClientLinkerComponent = {
          ...component,
          component_id: uuid(),
          component_name: component.linker_sequence.sequence,
          hr_name: component.linker_sequence.sequence,
        };
        saveComponent(items, index, linkerComponent);
        break;
    }
  };

  const updateDomainOptions = (geneId: string, geneSymbol: string) => {
    if (!(geneId in domainOptions)) {
      getAssociatedDomains(geneId).then(associatedDomainsResponse => {
        setDomainOptions(
          {
            ...domainOptions,
            ...{ [`${geneSymbol}(${geneId})`]: associatedDomainsResponse.suggestions }
          }
        );
      });
    }
  };

  const saveComponent = (items: Array<Object>, index: number, newObj: Object) => {
    items.splice(index, 1, newObj);

    // clear active state, update local state array, update global fusion object
    setEditMode('');
    setStructure(items);
    setFusion({ ...fusion, ...{ 'transcript_components': items } });
  };

  const handleCancel = (id: string) => {
    let items = Array.from(structure);
    items = items.filter(item => item.component_id !== id);
    setEditMode('');
    setStructure(items);
  };

  const handleDelete = (id) => {
    let items = Array.from(structure);
    items = items.filter(item => item.component_id !== id);
    setStructure(items);
    setFusion({ ...fusion, ...{ 'transcript_components': items } });
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
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    // dropped outside the list
    if (!destination) return;
    if (destination.droppableId === source.droppableId) {
      reorder(result);
    } else {
      copy(result);
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
                      if (snapshot.isDragging && editMode !== '') {
                        handleCancel(editMode);
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
            {(provided) => (
              <div className='block-container' {...provided.droppableProps} ref={provided.innerRef}>
                <h2 className={`${structure.length === 0 ? 'instruction' : 'hidden'}`}>
                  Drag components here
                </h2>
                {structure.map(({ component_id, hr_name, component_type }, index) => {
                  return (
                    <Draggable key={component_id} draggableId={component_id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef}
                          className={`block ${component_type}`}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {
                            component_id === editMode ?
                              <TransCompInput
                                handleSave={handleSave}
                                handleCancel={handleCancel}
                                compType={component_type}
                                index={index}
                                key={component_id}
                                id={component_id}
                              />
                              : <div className="comp-input">
                                <div className="hr-name">
                                  {hr_name}
                                </div>
                                <div
                                  className="button-trash"
                                  onClick={() => handleDelete(component_id)}
                                >
                                  <ButtonTrash fill="#878799" width="40" height="15" />
                                </div>
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
              transcriptComponents.map((comp, index: number) => (
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
