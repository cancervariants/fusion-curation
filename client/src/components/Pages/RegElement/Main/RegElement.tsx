import React, { useContext, useRef } from 'react';
import Close from '../../Domains/Main/Close';
import { FusionContext } from '../../../../global/contexts/FusionContext';

import './RegElement.scss';
import RegElementForm from '../RegElementForm/RegElementForm';

interface Props {
  index: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const RegElement: React.FC<Props> = ({ index }) => {
  const { fusion, setFusion } = useContext(FusionContext);

  const regElements = fusion.regulatory_elements || [];

  // Don't want to change the suggested element. should maybe create a separate context of the
  // unmutated selected suggestion
  const initialElements = useRef(regElements);

  const handleRemove = (regEl) => {
    //copy regulatory elements array, then remove the element with the relevant ID
    let cloneArray = Array.from(regElements);
    cloneArray = cloneArray.filter((obj) => {
      return obj['element_id'] !== regEl['element_id'];
    });
    setFusion({ ...fusion, ...{ 'regulatory_elements': cloneArray || [] } });
  };

  return (
    <div className='reg-element-tab-container'>
      <div className='left'>
        <div className='blurb-container'>
          {
            initialElements.current.length > 0 ?
              <div className='blurb'>
                This transcript structure appears to be associated with a
                {
                  initialElements.current.map(regEl => (
                    // eslint-disable-next-line react/jsx-key
                    <span className='bold'>
                      {regEl.gene_descriptor.label.toUpperCase()} {regEl.type}
                    </span>
                  ))
                } Regulatory Element.
              </div>
              :
              <div className='blurb'>
                No regulatory element found.
              </div>
          }
          <div className='sub-blurb'>
            You can add or remove regulatory elements.
          </div>

          {regElements.map(regEl => (
            // eslint-disable-next-line react/jsx-key
            <div className='regel'>
              <div>{regEl.gene_descriptor.label.toUpperCase()} {regEl.type}</div>
              <div className='close-button-reg' onClick={() => handleRemove(regEl)}>
                <Close />
              </div>
            </div>
          ))
          }
        </div>
      </div>
      <div className='right'>
        <RegElementForm />
      </div>
    </div>
  );
};