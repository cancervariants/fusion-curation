import { useContext } from 'react';
import { GeneContext } from '../../../../contexts/GeneContext';
import { StructureDiagram } from '../StructureDiagram/StructureDiagram';

import './GeneResults.scss'

export const GeneResults: React.FC = () => {

const {genes, setGenes} = useContext(GeneContext);

  return (
    <>
      { genes.length > 1 && 
        <div className="gene-results">
          <h1>
            {genes[0]}, {genes[1]}
          </h1>
          <h4>We found some common fusion structures.</h4>
          <h4>You can apply one that matches (or to use as a starting point)</h4>
          <div className="diagrams">
            <StructureDiagram/>  
          </div>
          
        </div>
      }
    </>


  )
}