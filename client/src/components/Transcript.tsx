import { useContext, useCallback, Fragment } from 'react';
import { ResponsesContext } from '../contexts/ResponsesContext';
import {Question} from './Question';
import CTCompInput from './CTCompInput';

import { Button } from '@material-ui/core';

interface Props {
  index: number
  nextTab: (index: number) => void
}

export const Transcript: React.FC<Props> = ( {index, nextTab }) => {

  const {responses, setResponses} = useContext(ResponsesContext);

  const onClick = useCallback(() => {
    nextTab(index)
  }, [nextTab, index])

  return (
    <div>
      <Question 
        name="chimericTranscript" 
        prompt="Does the fusion create a chimeric transcript?"
      />

      { responses['chimericTranscript'] === 'Yes' ?
          <Fragment>
            <CTCompInput />
            <Button onClick={onClick} variant="contained" color="primary">Next</Button>
          </Fragment>
        : <Button variant="contained" disabled>Next</Button>
      }
      

    </div>
  )

}