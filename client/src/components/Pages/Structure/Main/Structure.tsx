import { v4 as uuid } from 'uuid';
import { useContext, useEffect, useState } from 'react';
import { FusionContext } from '../../../../global/contexts/FusionContext';

import Builder from '../Builder/Builder';
import {Button} from '@material-ui/core';
import './Structure.scss';

interface Props {
  index: number
}


// const Text = React.memo(() => {
//   const {fusion} = useContext(FusionContext);
// });

export const Structure: React.FC<Props> = ( { index }) => {

  const {fusion, setFusion} = useContext(FusionContext);
  
  const transcriptComponents = fusion.transcript_components || [];

  return (
    <div className="structure-tab-container">

      <div className="structure-summary">

        <h3>Structure Overview</h3>

        <h5>Drag and rearrange components to build the chimeric transcript.</h5>

        {/* <div className="summary-container">
          <div >
            {
              structure.map((comp, index) => (
                <span key={comp.component_id}>{`${index ? "::" : ""}${comp.hr_name}`}</span>
              ))
            }
          </div>
        </div> */}

        {/* <div className="summary-container">
          <div >
            {
              structure.map(comp => (
                <span key={comp.component_id} className={comp.component_type}>{`${comp.component_name}`} </span>
              ))
            }
          </div>
        </div> */}
      </div>

      <Builder transcriptComponents={transcriptComponents} />

    </div>
  )

}