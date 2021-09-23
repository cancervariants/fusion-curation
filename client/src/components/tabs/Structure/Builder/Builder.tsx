import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import './Builder.scss';
import { TransCompInput } from '../TransCompInput/TransCompInput';

const OPTIONS = [
  {
    "component_type": "gene",
    "component_name": "",
    "component_id": uuid(),
    "gene_descriptor": {
      "id": "",
      "type": "",
      "gene_id": "",
      "label": ""
    }
  },
  {
    "component_type": "transcript_segment",
    "component_name": "",
    "component_id": uuid(),
    "exon_start": null,
    "exon_start_offset": null,
    "exon_end": null,
    "exon_end_offset": null,
    "gene_descriptor": {
      "id": "",
      "gene_id": "",
      "type": "",
      "label": ""
    }
  },
  {
    "component_name": "",
    "component_type": "linker_sequence",
    "component_id": uuid(),
    // need an example linker structure
  },
  {
    "component_name": "",
    "component_type": "genomic_region",
    "component_id": uuid(),
    "id": "",
    "type": "",
    "location": {
      "sequence_id": "",
      "type": "",
      "interval": {
        "start": {
          "type": "",
          "value": null
        },
        "end": {
          "type": "",
          "value": null
        },
        "type": ""
      }
    }
  },
]

const Builder: React.FC = () =>  {
  const {fusion, setFusion} = useContext(FusionContext);
  const [structure, setStructure] = useState([]);
  const [editMode, setEditMode] = useState('');


  useEffect(() => {
    let diagram = [];

    if("transcript_components" in fusion){
      fusion["transcript_components"].map(comp => (
        diagram.push(comp)
      ))
      setStructure(diagram);
    }
  }, [])

  const copy = (result: DropResult) => {
    const {source, destination} = result;
  
    const sourceClone = Array.from(OPTIONS);
    const destClone = Array.from(structure);
    const item = sourceClone[source.index];
    const newItem = Object.assign({}, item);
    newItem.id = uuid();
    destClone.splice(destination.index, 0, newItem)
    setStructure(destClone);
    setEditMode(newItem.component_id);
  };

  const reorder = (result: DropResult) => {

    // no dragging until done editing. the isDragDisabled prop is preferable for this,
    // but it seems to impede seamless dragging even when false. 
    if(editMode !== ''){
      return 
    }

    const {source, destination} = result;

    if (structure.length > 0){
      const sourceClone = Array.from(structure);
      const [newOrder] = sourceClone.splice(source.index, 1);
      sourceClone.splice(destination.index, 0, newOrder);
    
      setFusion({ ...fusion, ...{ "transcript_components" : sourceClone }})
      setStructure(sourceClone);
    }
  };

  const handleSave = (index, input) => {

    const items = Array.from(structure);
    let obj = items[index];
    let newObj = Object.assign({}, obj)


    // need to actually handle inputs, validate from server    
    newObj['component_name'] = input.current.value;

    items.splice(index, 1, newObj);

    // clear active state
    setEditMode('');

    // update local state array
    setStructure(items);

    // update global fusion object
    setFusion({ ...fusion, ...{ "transcript_components" : items }})

    
  }


  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) return;

    if(destination.droppableId === source.droppableId) {
      reorder(result);
    } else {
      copy(result);
    }
  };

    return (
      <div className="builder">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="OPTIONS" isDropDisabled={true}>
            {(provided, snapshot) => (
              <div className="options" 
                {...provided.droppableProps} 
                ref={provided.innerRef}
              >
                <div className="options-container">
                {OPTIONS.map(({component_id, component_type }, index) => (
                  
                    <Draggable 
                      key={component_id} 
                      draggableId={component_id} 
                      
                      index={index}
                      >
                      
                      {(provided, snapshot) => (
                        <React.Fragment>
                          <div 
                           
                            ref={provided.innerRef}
                            className={`option-item ${component_type }`} 
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              transform: snapshot.isDragging
                                ? provided.draggableProps.style?.transform
                                : 'translate(0px, 0px)',
                            }}
                            
                          >
                            {component_type }
                          </div>
                          {snapshot.isDragging && (
                              <div style={{ transform: 'none !important' }} className={`option-item clone ${component_type }`}>
                              {component_type }
                              </div>
                            )}
                        </React.Fragment>
                      )}
                    </Draggable>
                  
                ))}
                </div>

              </div>
            )}
          </Droppable>
        <Droppable droppableId="structure">
                {(provided) => (
                  <div className="block-container" {...provided.droppableProps} ref={provided.innerRef}>
                    {structure.map(({component_id, component_name, component_type}, index) => {
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
                                <TransCompInput handleSave={handleSave} compType={component_type} index={index} id={component_id}/>
                                : <span>{component_name}</span>
                              }
                              
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                  </div>
                )}
              </Droppable>
      </DragDropContext>
      </div>
    )
}

export default Builder;
