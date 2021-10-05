import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import './Builder.scss';
import { TransCompInput } from '../TransCompInput/TransCompInput';

// TODO: should be dynamic
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
  let transcriptComponents = fusion.transcript_components || [];

  

  useEffect(() => {
    let diagram = [];

    if("transcript_components" in fusion){
      fusion.transcript_components.map(comp => (
        diagram.push(comp)
      ))
      setStructure(diagram);
    }
  })


  const copy = (result: DropResult) => {
    // TODO: remove forms that were never saved before adding new ones

    const {source, destination} = result;
  
    const sourceClone = Array.from(OPTIONS);
    const destClone = Array.from(structure);
    const item = sourceClone[source.index];
    const newItem = Object.assign({}, item);
    newItem.component_id = uuid();
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

  const handleSave = (index, compType, ...values) => {

    // TODO: prevent from sending empty fields (where applicable)

    
    const items = Array.from(structure);
    let obj = items[index];
    let newObj = Object.assign({}, obj)


    // TODO: Update backend schema to include component_name and any other keys

    // building properties of newObj (which then gets pushed to transcript_components)
    switch(compType){

      case 'gene': 
      let [symbol] = values;

      if (symbol === 'ANY') {
        newObj = {
          "component_type": "gene",
          "component_name": "<ANY>",
          "component_id": uuid(),
          "hr_name": "<ANY>",
          "gene_descriptor": {
            "id": "",
            "type": "GeneDescriptor",
            "gene_id": "",
            "label": "ANY"
          }
        }
        save(items, index, newObj);
      } else {
        getGeneId(symbol).then(geneResponse => {
          newObj = {
            "component_type": "gene",
            "component_name": `${geneResponse.term.toUpperCase()} ${geneResponse.concept_id}`,
            "component_id": uuid(),
            "hr_name": `${geneResponse.term.toUpperCase()}(${geneResponse.concept_id})`,
            "gene_descriptor": {
              "id": `gene:${geneResponse.term}`,
              "type": "GeneDescriptor",
              "gene_id": geneResponse.concept_id,
              "label": geneResponse.term
            }
          }
  
          save(items, index, newObj);
          
        })
      }
      
      break;

      case 'transcript_segment': 
        let [transcript,  gene_symbol, exon_start, exon_end, exon_start_offset, exon_end_offset] = values

        exon_start = parseInt(exon_start);
        exon_end = parseInt(exon_end); 
        exon_start_offset = parseInt(exon_start_offset);
        exon_end_offset = parseInt(exon_end_offset);

        getExon(transcript, exon_start || 0, exon_end || 0,
          exon_start_offset || 0, exon_end_offset || 0, gene_symbol).then(exonResponse => {

            let {tx_ac, gene, gene_id, exon_start, exon_end, exon_start_offset, exon_end_offset, sequence_id, chr, start, end, warnings } = exonResponse;

            let eso;
            if(exon_start_offset > 0){
              eso = `+${exon_start_offset}`
            } else if (exon_start_offset < 0){
              eso = `${exon_start_offset}`
            } else {
              eso = '';
            }

            let eeo;
            if(exon_end_offset > 0){
              eeo = `+${exon_end_offset}`
            } else if (exon_end_offset < 0){
              eeo = `${exon_end_offset}`
            } else {
              eeo = '';
            }

            let hrExon;
            if(exon_start && exon_end){
              hrExon = `e[${exon_start}${eso}_${exon_end}${eeo}]`;
            } else if (exon_start) {
              hrExon = `e[${exon_start}${eso}_]`;
            } else {
              hrExon = `e[_${exon_end}${eeo}]`;
            }


            newObj = {
              "component_type": "transcript_segment",
              "component_name": `${tx_ac} ${gene}`,
              "transcript": tx_ac,
              "component_id": uuid(),
              "shorthand": tx_ac,
              "exon_start": exon_start,
              "exon_start_offset": exon_start_offset,
              "exon_end": exon_end,
              "exon_end_offset": exon_end_offset,
              "gene_descriptor": {
                "id": `gene:${gene}`,
                "gene_id": gene_id,
                "type": "GeneDescriptor",
                "label": `${gene}`
              }
            }

            newObj.hr_name = `${tx_ac}(${gene}):${hrExon}`

            save(items, index, newObj);

          //TODO: nested genomic region (lookup GR based on transcript and vice versa)
            // getSequenceId(chr).then(sequenceResponse => {
            //   let [sequence, sequence_id, warnings] = sequenceResponse; 
            // })
          }) 
          
          
      break;
      
      case 'genomic_region':
          let [chromosome, strand, startPosition, endPosition] = values;
          getSequenceId(chromosome).then(sequenceResponse => {

            let {sequence, sequence_id, warnings} = sequenceResponse;

            newObj = {
              "component_type": "genomic_region",
              "component_name": `chr${chromosome}:${startPosition}-${endPosition}(${strand})`,
              "hr_name": `chr${chromosome}:${startPosition}-${endPosition}(${strand})`,
              "component_id": uuid(),
              "region": {
                "id": `chr${chromosome}:${startPosition}-${endPosition}(${strand})`,
                "type": "LocationDescriptor",
                "location": {
                  "type": "SequenceLocation",
                  "sequence_id": sequence_id,
                  "interval": {
                    "type": "SequenceLocation",
                    "start": {
                      "type": "Number",
                      "value": startPosition,
                    },
                    "end": {
                      "type": "Number",
                      "value": endPosition,
                    },                  
                  }
                },
                "label": `chr${chromosome}:${startPosition}-${endPosition}(${strand})`
              },
              "strand": strand
            }
            save(items, index, newObj);
          })
      break;

      case 'linker_sequence':
          let [sequence] = values;
          newObj = {
            "component_type": "linker_sequence",
            "component_name": sequence,
            "component_id": uuid(),
            "hr_name": sequence,
            "linker_sequence": {
              "id": `sequence:${sequence}`,
              "type": "SequenceDescriptor",
              "sequence": sequence,
            }
          }
          save(items, index, newObj);
      break;
    }  
  }

  const save = (items, index, newObj) => {

    items.splice(index, 1, newObj);

    // clear active state, update local state array, update global fusion object
    setEditMode('');
    setStructure(items);
    setFusion({ ...fusion, ...{ "transcript_components" : items }});
  
  }

  const getGeneId = async (symbol) => {
    // TODO: error handling
    let response = await fetch(`/lookup/gene?term=${symbol}`);
    let geneId = await response.json();
    return geneId;
  };

  const getSequenceId = async (chr) => {
    let response = await fetch(`/lookup/sequence_id?input_sequence=GRCh38:${chr}`);
    let sequenceId = await response.json();
    return sequenceId;  
  }

  const getExon = async (txAc, startExon, endExon, startExonOffset, endExonOffset, gene) => {
    let reqObj = {
      tx_ac: txAc,
      gene: gene,
      exon_start: startExon,
      exon_start_offset: startExonOffset,
      exon_end: endExon,
      exon_end_offset: endExonOffset
    }

    let response = await fetch(`/lookup/coords`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqObj),
    });

    let exonResponse = await response.json();

    return exonResponse;

  }

  const handleCancel = (id) => {
    let items = Array.from(structure);
    items = items.filter(item => item.component_id !== id);
    
    setEditMode('');
    setStructure(items);
  }

  const formatType = (str) => {
    switch(str){
      case 'gene':
        return 'Gene'
      case 'transcript_segment':
        return 'Transcript Segment'
      case 'linker_sequence':
        return 'Linker Sequence'
      case 'genomic_region':
        return 'Genomic Region'
    }
      
  }


  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) return;

    if(destination.droppableId === source.droppableId ) {
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
                      
                      {(provided, snapshot) => {

                        // crude way of cancelling when user has an unsaved component
                        if(snapshot.isDragging && editMode !== ''){
                          handleCancel(editMode);
                        }
                        return (<React.Fragment>
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
                            {formatType(component_type) }
                          </div>
                          {snapshot.isDragging && (
                              <div style={{ transform: 'none !important' }} key={component_id} className={`option-item clone ${component_type }`}>
                              {formatType(component_type) }
                              </div>
                            )}
                        </React.Fragment>)
                      }}
                    </Draggable>
                  
                ))}
                </div>

              </div>
            )}
            
          </Droppable>
          <div className="right-side">

          
        <Droppable droppableId="structure">
          {(provided) => (
            <div className="block-container" {...provided.droppableProps} ref={provided.innerRef}>
              <h2 className={`${structure.length === 0 ? "instruction" : "hidden"}`}>Drag components here</h2>
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
                          <TransCompInput handleSave={handleSave} handleCancel={handleCancel}  compType={component_type} index={index} key={component_id} id={component_id}/>
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

          <div className="hr-section">
            {
              transcriptComponents.map((comp, index) => (
                <div key={comp.component_id}>{`${index ? "::" : ""}${comp.hr_name}`}</div>
              ))
            }
          </div>

        </div>
        
      </DragDropContext>
      
      </div>
    )
}

export default Builder;
