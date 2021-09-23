import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import './Builder.scss';
import { TransCompInput } from '../TransCompInput/TransCompInput';


const OPTIONS = [
  {
    id: uuid(),
    name: "Gene",
    result: 'empty!',
    classname: "gene"
  },
  {
    id: uuid(),
    name: "Transcript Component",
    result: 'empty!',
    classname: "transcript_segment"
  },
  {
    id: uuid(),
    name: "Linker Sequence",
    result: 'empty!',
    classname: "linker_sequence"
  },
  {
    id: uuid(),
    name: "Genomic Region",
    result: 'empty!',
    classname: "genomic_region"
  }
]

const Builder: React.FC = () =>  {
  const {fusion} = useContext(FusionContext);
  const [structure, setStructure] = useState([]);
  const [editMode, setEditMode] = useState('');

  useEffect(() => {
    let diagram = [];
    if("transcript_components" in fusion){
      fusion["transcript_components"].map(comp => (
        // should have something like "component_name" that's found on each component regardless of type
        // basically a headline summary
        diagram.push({
          id: uuid(),
          name: comp["component_type"],
          result: 'refseq:NM_152263.3_exon1-exon8',
          classname: comp["component_type"]
        }) 
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
    setEditMode(newItem.id);
  };

  const reorder = (result: DropResult) => {
    const {source, destination} = result;

    if (structure.length > 0){
      const sourceClone = Array.from(structure);
      const [newOrder] = sourceClone.splice(source.index, 1);
      sourceClone.splice(destination.index, 0, newOrder);
      setStructure(sourceClone);
    }

  };

  const handleSave = (index) => {
    const items = Array.from(structure);
    let obj = items[index];
    let newObj = Object.assign({}, obj)
    newObj.result = 'refseq:NM_152263.3_exon1-exon8'
    items.splice(index, 1, newObj);
    setStructure(items);

    setEditMode('');
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
                {OPTIONS.map(({id, name, classname }, index) => (
                  
                    <Draggable 
                      key={id} 
                      draggableId={id} 
                      
                      index={index}
                      >
                      
                      {(provided, snapshot) => (
                        <React.Fragment>
                          <div 
                           
                            ref={provided.innerRef}
                            className={`option-item ${classname}`} 
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              transform: snapshot.isDragging
                                ? provided.draggableProps.style?.transform
                                : 'translate(0px, 0px)',
                            }}
                            
                          >
                            {name}
                          </div>
                          {snapshot.isDragging && (
                              <div style={{ transform: 'none !important' }} className={`option-item clone ${classname}`}>
                              {name}
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
                    {structure.map(({id, result, classname}, index) => {
                      return (
                        <Draggable key={id} draggableId={id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef}
                              className={`block ${classname}`}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            
                            >
                              {
                                id === editMode ?
                                <TransCompInput handleSave={handleSave} compType={classname} index={index} id={id}/>
                                : <span>{result}</span>
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
