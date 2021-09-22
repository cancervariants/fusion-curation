import { useContext, useEffect } from 'react';
import { SuggestionContext } from '../../../../global/contexts/SuggestionContext';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import { StructureDiagram } from '../StructureDiagram/StructureDiagram';

import './GeneResults.scss'

export const GeneResults: React.FC = () => {

const [suggestions, setSuggestions] = useContext(SuggestionContext);
const {fusion, setFusion} = useContext(FusionContext);


return (
  
  <div className="gene-results">
    {
      suggestions.length ? 
      <>
        <h1>
          {`${suggestions[0].genes[0]}, ${suggestions[0].genes[1]}`}
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