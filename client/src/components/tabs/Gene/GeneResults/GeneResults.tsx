import { useContext } from 'react';
import { SuggestionContext } from '../../../../global/contexts/SuggestionContext';
import { StructureDiagram } from '../StructureDiagram/StructureDiagram';

import './GeneResults.scss'

export const GeneResults: React.FC = () => {

const {suggestions, setSuggestions} = useContext(SuggestionContext);


return (
  
  <div className="gene-results">
    {
      suggestions.length > 1 ? 
      <>
        <h1>
          {`${suggestions[0]}::${suggestions[1]}`}
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