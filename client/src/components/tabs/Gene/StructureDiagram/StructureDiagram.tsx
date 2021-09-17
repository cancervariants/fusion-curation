import React, { useContext, useState } from 'react';
import { GeneContext } from '../../../../global/contexts/GeneContext';
import { StructureContext } from '../../../../global/contexts/StructureContext';
import Grid from '@material-ui/core/Grid';


import './StructureDiagram.scss'

export const StructureDiagram: React.FC = () => {

  const {genes} = useContext(GeneContext);
  const {structure, setStructure} = useContext(StructureContext);

  const [active, setActive] = useState(-1);

  const [structureList, setStructureList] = useState([
    ['gn', 'tc', 'ls', 'gr'],
    ['gn', 'tc', 'ls', 'gr'],
    ['gn'],
    ['tc', 'ls', 'gr'],
    ['ls', 'gr'],
    ['gn', 'ls', 'gr'],
  ]);

  const selectStructure = (structure: string[], index: number) => {
    setStructure(structure)
    setActive(index)
  }
 
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