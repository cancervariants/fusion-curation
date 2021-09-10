import React, { useContext, useState } from 'react';
import { GeneContext } from '../../../../contexts/GeneContext';
import Grid from '@material-ui/core/Grid';


import './StructureDiagram.scss'

export const StructureDiagram: React.FC = () => {

  const {genes} = useContext(GeneContext);

  const [structureList, setStructureList] = useState([
    ['gn', 'tc', 'ls', 'gr'],
    ['gn', 'tc', 'ls', 'gr'],
    ['gn'],
    ['tc', 'ls', 'gr'],
    ['ls', 'gr'],
    ['gn', 'ls', 'gr'],
  ]);

  function FormRow() {
    return (
      <React.Fragment>

      </React.Fragment>
    )
  }

  return (
      <Grid container justify = "center">
        {structureList.map((structure) => (
          <div className="structure">
          {structure.map((s) => (
            <span className={s}>{s}</span>
          ))}
          </div>

        ))}
      </Grid>
  )
}