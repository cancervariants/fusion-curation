import { useContext } from 'react';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import Builder from '../Builder/Builder';
import './Structure.scss';

export const Structure: React.FC = () => {
  const fusion = useContext(FusionContext).fusion;

  return (
    <div className="structure-tab-container">
      <div className="structure-summary">
        <h3>Structure Overview</h3>
        <h5>
          Drag and rearrange components to build the chimeric transcript.
          {
            fusion.structural_components?.length >= 2 ?
              null
              : <span className="error-banner"> Must provide at least 2 components.</span>
          }
        </h5>
      </div>
      <Builder />
    </div>
  );
};
