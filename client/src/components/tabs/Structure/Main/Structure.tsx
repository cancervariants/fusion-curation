import { useState, useEffect, useContext } from 'react';
import { FusionContext } from '../../../../global/contexts/FusionContext';

import Builder from '../Builder/Builder';

import './Structure.scss';

interface Props {
  index: number
}


// const Text = React.memo(() => {
//   const {fusion} = useContext(FusionContext);

// });

export const Structure: React.FC<Props> = ( { index }) => {

  const {fusion} = useContext(FusionContext);
  const [structure, setStructure] = useState([]);

  useEffect(() => {
    handleReorder();
    console.log(`${JSON.stringify(fusion)}`)
  }, [])

  const handleReorder = () => {
    let diagram = [];
    if("transcript_components" in fusion){
      fusion["transcript_components"].map(comp => (
        diagram.push(comp) 
      ))
      setStructure(diagram);
    }
  }



  return (
    <div className="structure-tab-container">

      <div className="summary-title">
      <h3>Structure Summary</h3>
      </div>
      
      <div className="summary-container">
      <div className="structure-summary">

        {
          structure.map(comp => (
            <span className={comp["component_type"]}>{`${comp["component_name"]}`} </span>
          ))
        }

      </div>
      </div>


      <Builder handleReorder={handleReorder}/>
      
      

    </div>
  )

}