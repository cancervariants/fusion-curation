import { useState, useEffect, useContext } from 'react';
import { FusionContext } from '../../../../global/contexts/FusionContext';

import Builder from '../StructureForm/Builder';

import './Structure.scss';

interface Props {
  index: number
}

export const Structure: React.FC<Props> = ( { index }) => {

  const {fusion} = useContext(FusionContext);
  const [structure, setStructure] = useState([]);

  useEffect(() => {
    let diagram = [];
    if("transcript_components" in fusion){
      fusion["transcript_components"].map(comp => (
        diagram.push(comp["component_type"]) 
      ))
      setStructure(diagram);
    }
  })

  return (
    <div className="structure-tab-container">

      <div className="summary-title">
      <h3>Structure Summary</h3>
      </div>
      
      <div className="summary-container">
      <div className="structure-summary">

        {
          structure.map(compType => (
            <span className={compType}>{`${compType}`} </span>
          ))
        }

      </div>
      </div>


      <Builder />
      
      

    </div>
  )

}