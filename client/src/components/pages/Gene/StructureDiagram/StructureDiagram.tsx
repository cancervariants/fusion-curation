import { useContext, useState } from 'react';
import { GeneContext } from '../../../../contexts/GeneContext';

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

  return (
    <div>
      {structureList.map((structure) => (
        <div>
        {structure.map((s) => (
          <span className={s}>{s}</span>
        ))}
        </div>

      ))}
    </div>


  )
}