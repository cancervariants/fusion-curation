import { useContext } from 'react';
import { ResponsesContext } from '../../../contexts/ResponsesContext';
import { YesNo } from '../../shared/yesno/YesNo';
import CTForm from './CTForm';


interface Props {
  index: number
}

export const Transcript: React.FC<Props> = ( { index }) => {

  const {responses} = useContext(ResponsesContext);

  return (
    <div>
      <YesNo 
        name="chimericTranscript" 
        prompt="Does the fusion create a chimeric transcript?"
      />

      { responses['chimericTranscript'] === 'Yes' ?
            <CTForm />
        : null
      }
      

    </div>
  )

}