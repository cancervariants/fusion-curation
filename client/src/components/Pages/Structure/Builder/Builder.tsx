import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { DomainOptionsContext } from '../../../../global/contexts/DomainOptionsContext';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import './Builder.scss';
import { TransCompInput } from '../TransCompInput/TransCompInput';
import { getGeneId, getAssociatedDomains, getSequenceId, getExon } from '../../../../services/main';


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
    'component_type': 'genomic_region',
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

  const handleSave = (index: number, compType: string, ...values: Array<string>) => {
    // TODO: prevent from sending empty fields (where applicable)
    const items = Array.from(structure);
    const obj = items[index];
    let newObj = Object.assign({}, obj);

    // TODO: Update backend schema to include component_name and any other keys

    // building properties of newObj (which then gets pushed to transcript_components)
    switch (compType) {
      case 'gene':
        // eslint-disable-next-line prefer-const
        let [symbol] = values;
        if (symbol === 'ANY') {
          newObj = {
            'component_type': 'gene',
            'component_name': '*',
            'component_id': uuid(),
            'hr_name': '*',
            'gene_descriptor': {
              'id': '',
              'type': 'GeneDescriptor',
              'gene_id': '',
              'label': 'ANY'
            }
          };
          saveComponent(items, index, newObj);
        } else {
          getGeneId(symbol).then(geneResponse => {
            const geneId = geneResponse.concept_id;
            newObj = {
              'component_type': 'gene',
              'component_name': `${geneResponse.term.toUpperCase()} ${geneResponse.concept_id}`,
              'component_id': uuid(),
              'hr_name': `${geneResponse.term.toUpperCase()}(${geneResponse.concept_id})`,
              'gene_descriptor': {
                'id': `gene:${geneResponse.term}`,
                'type': 'GeneDescriptor',
                'gene_id': geneId,
                'label': geneResponse.term
              }
            };
            updateDomainOptions(geneId);
            saveComponent(items, index, newObj);
          });
        }
        break;
      case 'transcript_segment':
        const [transcript, gene_symbol, exon_start_str, exon_end_str, exon_start_offset_str,
          exon_end_offset_str] = values;

        const exon_start = parseInt(exon_start_str);
        const exon_end = parseInt(exon_end_str);
        const exon_start_offset = parseInt(exon_start_offset_str);
        const exon_end_offset = parseInt(exon_end_offset_str);

        getExon(
          transcript, gene_symbol, exon_start || 0, exon_end || 0, exon_start_offset || 0,
          exon_end_offset || 0
        ).then(exonResponse => {
          const {
            tx_ac, gene, gene_id, exon_start, exon_end, exon_start_offset, exon_end_offset,
            sequence_id, chr, start, end, warnings
          } = exonResponse;

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

          newObj = {
            'component_type': 'transcript_segment',
            'component_name': `${tx_ac} ${gene}`,
            'transcript': tx_ac,
            'component_id': uuid(),
            'shorthand': tx_ac,
            'exon_start': exon_start,
            'exon_start_offset': exon_start_offset,
            'exon_end': exon_end,
            'exon_end_offset': exon_end_offset,
            'gene_descriptor': {
              'id': `gene:${gene}`,
              'gene_id': gene_id,
              'type': 'GeneDescriptor',
              'label': `${gene}`
            }
          };

          newObj.hr_name = `${tx_ac}(${gene}):${hrExon}`;

          saveComponent(items, index, newObj);

          //TODO: nested genomic region (lookup GR based on transcript and vice versa)
          // getSequenceId(chr).then(sequenceResponse => {
          //   let [sequence, sequence_id, warnings] = sequenceResponse;
          // })
        });
        break;
      case 'genomic_region':
        // eslint-disable-next-line prefer-const
        let [chromosome, strand, startPosition, endPosition] = values;
        getSequenceId(chromosome).then(sequenceResponse => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          // eslint-disable-next-line prefer-const
          let { sequence, sequence_id, warnings } = sequenceResponse;
          newObj = {
            'component_type': 'genomic_region',
            'component_name': `chr${chromosome}:${startPosition}_${endPosition}(${strand})`,
            'hr_name': `chr${chromosome}:${startPosition}_${endPosition}(${strand})`,
            'component_id': uuid(),
            'region': {
              'id': `chr${chromosome}:${startPosition}_${endPosition}(${strand})`,
              'type': 'LocationDescriptor',
              'location': {
                'type': 'SequenceLocation',
                'sequence_id': sequence_id,
                'interval': {
                  'type': 'SequenceLocation',
                  'start': {
                    'type': 'Number',
                    'value': startPosition,
                  },
                  'end': {
                    'type': 'Number',
                    'value': endPosition,
                  },
                }
              },
              'label': `chr${chromosome}:${startPosition}-${endPosition}(${strand})`
            },
            'strand': strand
          };
          saveComponent(items, index, newObj);
        });
        break;
      case 'linker_sequence':
        // eslint-disable-next-line prefer-const
        let [sequence] = values;
        newObj = {
          'component_type': 'linker_sequence',
          'component_name': sequence,
          'component_id': uuid(),
          'hr_name': sequence,
          'linker_sequence': {
            'id': `sequence:${sequence}`,
            'type': 'SequenceDescriptor',
            'sequence': sequence,
          }
        };
        saveComponent(items, index, newObj);
        break;
    }
  };

  const updateDomainOptions = (geneId: string) => {
    if (!(geneId in domainOptions)) {
      getAssociatedDomains(geneId).then(associatedDomainsResponse => {
        setDomainOptions(
          {
            ...domainOptions,
            ...{ [geneId]: associatedDomainsResponse.suggestions }
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

  const formatType = (str: string) => {
    switch (str) {
      case 'gene':
        return 'Gene';
      case 'transcript_segment':
        return 'Transcript Segment';
      case 'linker_sequence':
        return 'Linker Sequence';
      case 'genomic_region':
        return 'Genomic Region';
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
                <h2
                  className={`${structure.length === 0 ? 'instruction' : 'hidden'}`}
                >
                  Drag components here
                </h2>
                {structure.map(({ component_id, component_name, component_type }, index) => {
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
                              : <span>{component_name}</span>
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
