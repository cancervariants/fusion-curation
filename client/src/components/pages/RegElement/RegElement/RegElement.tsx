import { useContext } from 'react';
import { ResponsesContext } from '../../../../contexts/ResponsesContext';

import RegElementForm from '../RegElementForm/RegElementForm';

interface Props {
  index: number
}

export const RegElement: React.FC<Props> = ( { index }) => {

  const {responses} = useContext(ResponsesContext);

  return (
    <div>
      

    </div>
  )

}