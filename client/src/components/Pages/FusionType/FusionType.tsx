/*
 * TODO
 * the assayed/categorical buttons should actually be radio-like,
 * and once a user has picked one, they should show that visually (ie indented or outlined
 * or something)
 */
import { Button } from '@material-ui/core';
import { useContext } from 'react';
import { FusionContext } from '../../../global/contexts/FusionContext';
import './FusionType.scss';
import {
  ClientAssayedFusion, ClientCategoricalFusion
} from '../../../services/ResponseModels';

interface Props {
  index: number
}

const ASSAYED_FUSION_TEMPLATE: ClientAssayedFusion = {
  type: 'AssayedFusion',
  structural_elements: [],
  // technically, causative_event.event_type should be filled,
  // but the user hasn't made a selection yet
  causative_event: {}
};

const CATEGORICAL_FUSION_TEMPLATE: ClientCategoricalFusion = {
  type: 'CategoricalFusion',
  structural_elements: [],
};

export const FusionType: React.FC<Props> = () => {
  const { fusion, setFusion } = useContext(FusionContext);

  const selectAssayed = () => {
    setFusion({...ASSAYED_FUSION_TEMPLATE});
  };

  const selectCategorical = () => {
    setFusion({...CATEGORICAL_FUSION_TEMPLATE});
  };

  return (
    <div className='fusion-type-container'>
      <div className='assayed'>
        <Button onClick={() => selectAssayed()}>
          Assayed
        </Button>
      </div>
      <div className='categorical'>
        <Button onClick={() => selectCategorical()}>
          Categorical
        </Button>
      </div>
    </div>
  );
};