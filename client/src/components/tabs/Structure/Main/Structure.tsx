import { useContext } from 'react';
import { ResponsesContext } from '../../../../global/contexts/ResponsesContext';
import {GeneSearch} from '../../Gene/GeneSearch/GeneSearch';
import StructureForm from '../StructureForm/StructureForm';
import Structure2 from '../StructureForm/Structure2';
import './Structure.scss';

interface Props {
  index: number
}

export const Structure: React.FC<Props> = ( { index }) => {

  return (
    <div className="structure-container">

      <div className="summary-title">
      <h3>Structure Summary</h3>
      </div>
      
      <div className="summary-container">
      <div className="structure-summary">
        <span className="gn2">&nbsp;</span>
        <span className="tc2">&nbsp;</span>
        <span className="gr2">&nbsp;</span>
      </div>
      </div>


      <Structure2 />
      
      

    </div>
  )

}