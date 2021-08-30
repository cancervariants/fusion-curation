import { useContext } from 'react';
import { ResponsesContext } from '../../../contexts/ResponsesContext';
import { YesNo } from '../../shared/yesno/YesNo';

interface Props {
  index: number
}
export const Gene: React.FC<Props> = ( { index }) => {

  const {responses} = useContext(ResponsesContext);
  return (
    <div>
      
    </div>
  )
}