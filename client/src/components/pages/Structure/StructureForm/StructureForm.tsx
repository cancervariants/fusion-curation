import React, { useState } from 'react';
import { StructureInput } from '../StructureInput/StructureInput';
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import './Structure.scss';

const compOptions = [
  {
    id: "1",
    name: "Gene",
  },
  {
    id: "2",
    name: "Transcript Component",
  },
  {
    id: "3",
    name: "Linker Sequence",
  },
  {
    id: "4",
    name: "Genomic Region",
  },
]

const listComps = [
  {
    id: "1",
    name: "Gene",
    result: "BCR",
  },
  {
    id: "2",
    name: "Transcript Component",
    result: "E14A2 ABL1",
  },
  {
    id: "3",
    name: "Linker Sequence",
    result: "ABL2 Y272",
  },
  {
    id: "4",
    name: "Genomic Region",
    result: "EFB1 Exons 7-9",
  },
]

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  padding: 10,
  margin: `0 50px 15px 50px`,
  background: isDragging ? "#4a2975" : "white",
  color: isDragging ? "white" : "black",
	border: `1px solid black`,
	fontSize: `20px`,
	borderRadius: `5px`,

	...draggableStyle
})

const StructureForm: React.FC = () => {
  const [comps, setComps] = useState(listComps);

  const onDragEnd = (result: DropResult) => {
    const {source, destination} = result;
    if(!destination) return;

    const items = Array.from(comps);
    const [newOrder] = items.splice(source.index, 1)   
    items.splice(destination.index, 0, newOrder) 

    setComps(items);
  }

  return (
    <>
    <div className="StructureForm">

      <h1>Drag and Drop</h1>
      <DragDropContext onDragEnd={onDragEnd}>

      <Droppable droppableId="compOptions">
          {(provided) => (
              <div className="compOptions" {...provided.droppableProps} ref={provided.innerRef}>
                {compOptions.map(({id, name}, index) => {
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef}
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

        <Droppable droppableId="comps">
          {(provided) => (
            <div className="comps" {...provided.droppableProps} ref={provided.innerRef}>
              {comps.map(({id, name, result}, index) => {
                return (
                  <Draggable key={id} draggableId={id} index={index}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      >
                        {name} {result}
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



    {/* <StructureInput title="Transcript Region" inputs={['Transcript', 'Starting Exon', 'Ending Exon', 'Gene']}/>
    <StructureInput title="Genomic Region" inputs={['Chromosome', 'Strand', 'Start Position', 'End Position']}/>
    <StructureInput title="Linker" inputs={['Sequence']}/>
    <StructureInput title="Gene" inputs={['Gene']}/> */}
    </>
  )
}

export default StructureForm;