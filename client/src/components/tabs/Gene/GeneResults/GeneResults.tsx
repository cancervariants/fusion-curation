import { useContext } from 'react';
import { GeneContext } from '../../../../global/contexts/GeneContext';
import { StructureDiagram } from '../StructureDiagram/StructureDiagram';

import './GeneResults.scss'

export const GeneResults: React.FC = () => {

const {genes, setGenes} = useContext(GeneContext);


return (
  
  <div className="gene-results">
    {
      genes.length > 1 ? 
      <>
        <h1>
          {`${genes[0]}::${genes[1]}`}
        </h1>
        <h4>We found some common fusion structures.</h4>
        <h4>You can apply one that matches (or to use as a starting point)</h4>
        <div className="diagrams">
          <StructureDiagram/>  
        </div>
      </>
    : <span className="empty">&nbsp;</span>
    }
    </div>


)
}