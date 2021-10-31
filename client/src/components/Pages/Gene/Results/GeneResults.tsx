import { useContext } from 'react';
import { SuggestionContext } from '../../../../global/contexts/SuggestionContext';
import { StructureDiagram } from '../StructureDiagram/StructureDiagram';
import { ColorKey } from '../ColorKey/ColorKey';
import './GeneResults.scss';

export const GeneResults: React.FC = () => {

  const [suggestions] = useContext(SuggestionContext);

  return (

    <div className="gene-results">
      {
        suggestions.length ?
          <>
            <h1>
              {
              /* TODO: Simulate searching genes array of fusion objects
               for potential suser uggestions */
              }
              {`${suggestions[0].genes[0]}, ${suggestions[0].genes[1]}`}
            </h1>
            <h4>We found some common fusion structures.</h4>
            <h4>You can apply one that matches (or to use as a starting point)</h4>

            <ColorKey />
            <div className="diagrams">
              <StructureDiagram />
            </div>
          </>
          : <span className="empty">&nbsp;</span>
      }
    </div>
  );
};