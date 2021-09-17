import React, { useState, useEffect } from 'react';
import { TransCompInput } from '../TransCompInput/TransCompInput';
import { StructureContext } from '../../../../global/contexts/StructureContext';
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import './Structure2.scss';
import {Grid, Card, CardContent, Button, TextField, Box} from '@material-ui/core';

import theme from '../../../../global/styles/theme';

const listOptions = [
  {
    id: "0",
    name: "Gene",
    result: 'card',
    classname: "gene-component"
  },
  {
    id: "1",
    name: "Transcript Component",
    result: 'card',
    classname: "transcript-component"
  },
  {
    id: "2",
    name: "Linker Sequence",
    result: 'card',
    classname: "linker-sequence"
  },
  {
    id: "3",
    name: "Genomic Region",
    result: 'card',
    classname: "genomic-region"
  },
]

const listComps = [
  {
    id: "4",
    name: "Gene",
    result: "BCR",
    classname: "gene-component"
  },
  {
    id: "5",
    name: "Transcript Component",
    result: "refseq:NM_152263.3",
    classname: "transcript-component"
  },
  // {
  //   id: "6",
  //   name: "Genomic Region",
  //   result: "EFB1 Exons 7-9",
  //   classname: "genomic-region"
  // },
]

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  padding: 10,
  margin: `0 50px 15px 50px`,
	fontSize: `18px`,
	borderRadius: `5px`,
	...draggableStyle
})

const StructureForm: React.FC = () => {

const [comps, setComps] = useState(listComps);
const [options, setOptions] = useState(listOptions);

const [front, setFront] = useState(true)

const handleSave = (index) => {
  const items = Array.from(comps);
  let obj = items[index];
  let newObj = Object.assign({}, obj)
  newObj.result = 'refseq:NM_152263.3_exon1-exon8'
  items.splice(index, 1, newObj)
  setComps(items);
}

useEffect(() => {
  setOptions(listOptions)
}, [comps]);

  const dragToAdd = (result: DropResult) => {
    
    const {source, destination} = result;
    if(!destination) return;
    
    if(destination.index < 4){
      return
    } else if (source.index > 3) {
      const items = Array.from(comps);
      const [newOrder] = items.splice(source.index - 4, 1)   
      items.splice(destination.index - 4, 0, newOrder) 

      setComps(items);
      return
    } else if (source.index <= 3) {
      
      if(destination.index < 4) return;

      const sourceClone = Array.from(options);
      const destClone = Array.from(comps);
      const item = sourceClone[source.index];
      const newItem = Object.assign({}, item);
      newItem.id = `${comps.length + options.length}`;
      destClone.splice(destination.index - 4, 0, newItem)
      setComps(destClone);
    }
  }
  return (
    <>
    <div className="structure-form">      
        <DragDropContext onDragEnd={dragToAdd}>
        <div className="component-adder">
        <h3>Drag to add new component</h3>
          <Droppable droppableId="options">
            {(provided) => (
              <div className="options" {...provided.droppableProps} ref={provided.innerRef}>
                {options.map(({id, name, classname }, index) => {
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef}
                         className={classname} 
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          {name}
                        </div>
                      )}
                    </Draggable>
                  )
                })}
              </div>
            )}
          </Droppable>
          </div>
        <div className="component-arranger">
          <h3>Drag to rearrange sequence</h3>
            <Droppable droppableId="comps">
                {(provided) => (
                  <div className="comps" {...provided.droppableProps} ref={provided.innerRef}>
                    {comps.map(({id, result, classname}, index) => {
                      return (
                        <Draggable key={id} draggableId={id} index={index + 4}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef}
                              className={classname}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
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
          </div>      
        </DragDropContext>
    </div>
    </>
  )
}

export default StructureForm;