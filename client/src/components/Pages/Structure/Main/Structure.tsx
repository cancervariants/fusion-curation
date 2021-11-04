import { useContext, useEffect, useState } from 'react';
import { FusionContext } from '../../../../global/contexts/FusionContext';
import Builder from '../Builder/Builder';
import './Structure.scss';

interface Props {
  index: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Structure: React.FC<Props> = ({ index }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fusion = useContext(FusionContext).fusion;
  const [structuralComponents, setStructuralComponents] = useState([]);

  useEffect(() => {
    setStructuralComponents(fusion.structural_components || []);
  }, [fusion]);

  return (
    <div className="structure-tab-container">
      <div className="structure-summary">
        <h3>Structure Overview</h3>
        <h5>
          Drag and rearrange components to build the chimeric transcript.
          {
            structuralComponents.length < 2 ?
              <span className="error-banner"> Must provide at least 2 components.</span>
              : null
          }
        </h5>
      </div>
      <Builder structuralComponents={structuralComponents} />
    </div>
  );
};