import React, { useContext, useState } from 'react';
import { GeneContext } from '../../../../contexts/GeneContext';
import { StructureContext } from '../../../../contexts/StructureContext';
import Grid from '@material-ui/core/Grid';


import './StructureDiagram.scss'

export const StructureDiagram: React.FC = () => {

  const {genes} = useContext(GeneContext);
  const {structure, setStructure} = useContext(StructureContext);

  const [structureList, setStructureList] = useState([
    ['gn', 'tc', 'ls', 'gr'],
    ['gn', 'tc', 'ls', 'gr'],
    ['gn'],
    ['tc', 'ls', 'gr'],
    ['ls', 'gr'],
    ['gn', 'ls', 'gr'],
  ]);

  const selectStructure = (structure: string[]) => {
    setStructure(structure)

  }

  return (
      <Grid container justify = "center">
        {structureList.map((structure) => (
          <div className="structure" onClick={() => selectStructure(structure)}>
          {structure.map((s) => (
            <span className={s}>{s}</span>
          ))}
          </div>

        ))}
      </Grid>
  )
}