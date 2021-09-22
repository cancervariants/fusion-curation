import React, { useContext, useState, useEffect } from 'react';
import { SuggestionContext } from '../../../../global/contexts/SuggestionContext';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import Grid from '@material-ui/core/Grid';


import './StructureDiagram.scss'

export const StructureDiagram: React.FC = () => {

  const [suggestions] = useContext(SuggestionContext);
  const {fusion, setFusion} = useContext(FusionContext);

  const [structureList, setStructureList] = useState([]);
  const [active, setActive] = useState(-1);

  

  useEffect(() => {
    // iterate over array of fusion objects from API, then push to diagram arrays
    suggestions.forEach(obj => {
      let diagram = [];
      obj["transcript_components"].map(comp => {
        diagram.push(comp["component_type"]); 
      })
      setStructureList([...structureList, diagram])
    })
  }, [suggestions])


  const selectStructure = (structure: string[], index: number) => {
    // selecting a diagram populates the remainder of the user fusion object
    setFusion({ ...suggestions, ...suggestions[index]})

    // add CSS class to selected diagram
    setActive(index)
  }

 
  return (
      <Grid container justify = "center">
        {structureList.map((structure, index) => (
          <div key={index} className={`structure ${active === index ? 'highlighted' : ''}`} onClick={() => selectStructure(structure, index)}>
          {structure.map((s) => (
            <span className={s}>hi</span>
          ))}
          </div>
        ))}
      </Grid>
  )
}

