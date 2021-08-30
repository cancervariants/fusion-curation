import { useContext } from 'react';
import { ResponsesContext } from '../../../contexts/ResponsesContext';
import { YesNo } from '../../shared/yesno/YesNo';
import REForm from './REForm'

interface Props {
  index: number
}

export const RegElement: React.FC<Props> = ( { index }) => {

  const {responses} = useContext(ResponsesContext);

  return (
    <div>
      <YesNo 
        name="regulatoryElement" 
        prompt="Does the fusion rearrange near a regulatory element?"
      />

      { responses['regulatoryElement'] === 'Yes' ?
            <REForm />
        : null
      }
      

    </div>
  )

}