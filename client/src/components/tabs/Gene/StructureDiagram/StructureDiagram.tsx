import React, { useContext, useState, useEffect } from 'react';
import { SuggestionContext } from '../../../../global/contexts/SuggestionContext';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import Grid from '@material-ui/core/Grid';


import './StructureDiagram.scss'

export const StructureDiagram: React.FC = () => {

  const [suggestions] = useContext(SuggestionContext);
  const {fusion, setFusion} = useContext(FusionContext);

  const [active, setActive] = useState(-1);

  const [structureList, setStructureList] = useState([]);

  const selectStructure = (structure: string[], index: number) => {
    setFusion(structure)
    setActive(index)
  }

  useEffect(() => {
    // iterate over array of fusion objects from API, then create diagrams
    suggestions.forEach(obj => {
      let diagram = [];
      obj["transcript_components"].map(comp => {
        diagram.push(comp["component_type"]); 
      })
      setStructureList([...structureList, diagram])
    })
  }, [suggestions])
 
  return (
      <Grid container justify = "center">
        {structureList.map((structure, index) => (
          <div key={index} className={`structure ${active === index ? 'highlighted' : ''}`} onClick={() => selectStructure(structure, index)}>
          {structure.map((s) => (
            <span className={s}>{s}</span>
          ))}
          </div>
        ))}
      </Grid>
  )
}