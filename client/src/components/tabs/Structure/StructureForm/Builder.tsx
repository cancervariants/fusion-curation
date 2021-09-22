import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import './Builder.scss';
import {Card, CardContent, Button, TextField, Box} from '@material-ui/core';


const OPTIONS = [
  {
    id: uuid(),
    name: "Gene",
    result: 'card',
    classname: "gene"
  },
  {
    id: uuid(),
    name: "Transcript Component",
    result: 'card',
    classname: "transcript_segment"
  },
  {
    id: uuid(),
    name: "Linker Sequence",
    result: 'card',
    classname: "linker_sequence"
  },
  {
    id: uuid(),
    name: "Genomic Region",
    result: 'card',
    classname: "genomic_region"
  }
]

const Builder: React.FC = () =>  {
  const {fusion} = useContext(FusionContext);
  const [structure, setStructure] = useState([]);

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
    items.splice(index, 1, newObj)
    setStructure(items);
  }


  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) return;

    // setStructure(copy(result));

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
                                result !== 'card' ?
                                <span>{result}</span> :
                                <Card >
                                <CardContent>
                                  <div className="card-parent">
                                    <div className="input-parent">
                                    <div className="top-inputs">
                                    <TextField margin="dense" style={{ height: 38, width: 125 }} label="Chromosome"></TextField>                
                                    <TextField margin="dense" style={{ height: 38, width: 125 }} label="Strand"></TextField>                
                                    </div>
                                    <div className="bottom-inputs">
                                    <TextField margin="dense" style={{ height: 38, width: 125 }} label="Start Position"></TextField>                
                                    <TextField margin="dense" style={{ height: 38, width: 125 }} label="End Position"></TextField>      
                                    </div> 
                                    </div>
                                    <div className="buttons">
                                    <Button style={{margin: '8px'}} variant="outlined" color="secondary" >Cancel</Button>
                                    <Button style={{margin: '8px'}} variant="outlined" color="primary" onClick={() => handleSave(index)}>Save</Button>
                                    </div>

                                        
                                  </div>
     
                                  
                                </CardContent>
                                </Card>
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
