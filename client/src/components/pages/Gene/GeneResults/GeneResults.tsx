import { useContext } from 'react';
import { GeneContext } from '../../../../contexts/GeneContext';
import { StructureDiagram } from '../StructureDiagram/StructureDiagram';

import './GeneResults.scss'

export const GeneResults: React.FC = () => {

const {genes, setGenes} = useContext(GeneContext);

  return (
    <div className="Gene-results">
      { genes.length > 1 && 
        <div>
          <h1>
            {genes[0]}, {genes[1]}
          </h1>
          <div>
            <p>We found some common fusion structures.</p>
            <p>You can apply one that matches (or to use as a starting point)</p>
          </div>  
          <StructureDiagram />  
        </div>

        

      }
    </div>


  )
}