import uuid from 'uuid';
import Builder from '../StructureForm/Builder';
import './Structure.scss';

interface Props {
  index: number
}

export const Structure: React.FC<Props> = ( { index }) => {

  return (
    <div className="structure-tab-container">

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


      <Builder />
      
      

    </div>
  )

}