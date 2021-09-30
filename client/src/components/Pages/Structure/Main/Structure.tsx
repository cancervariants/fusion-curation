import { useContext } from 'react';
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

  const structure = fusion.transcript_components || [];


  return (
    <div className="structure-tab-container">

      <div className="structure-summary">
      <h3>Structure Summary</h3>

      <div className="summary-container">
      <div >

        {
          structure.map(comp => (
            <span key={comp.component_id} className={comp.component_type}>{`${comp.component_name}`} </span>
          ))
        }

      </div>
      </div>
      </div>


      <Builder/>
      
      

    </div>
  )

}