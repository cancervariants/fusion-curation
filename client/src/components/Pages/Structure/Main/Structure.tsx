import { useContext } from 'react';
import { FusionContext } from '../../../../global/contexts/FusionContext';

import Builder from '../Builder/Builder';
import './Structure.scss';

interface Props {
  index: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Structure: React.FC<Props> = ({ index }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fusion, setFusion } = useContext(FusionContext);

  const transcriptComponents = fusion.transcript_components || [];

  return (
    <div className="structure-tab-container">
      <div className="structure-summary">
        <h3>Structure Overview</h3>
        <h5>Drag and rearrange components to build the chimeric transcript.</h5>
      </div>
      <Builder transcriptComponents={transcriptComponents} />
    </div>
  );
};