import React, { useContext } from 'react';
import { ResponsesContext } from '../../../contexts/ResponsesContext'

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

interface Props {
  name: string,
  prompt: string,
}

export const YesNo: React.FC<Props> = ({name, prompt }: Props) => {

  const {responses, setResponses} = useContext(ResponsesContext);

  const handleResponse = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResponses({ ...responses, ...{ [name]: (event.target as HTMLInputElement).value } });
  };

  return (
    <div>
      <FormControl component="fieldset">
        <FormLabel component="legend">{prompt}</FormLabel>
        <RadioGroup onChange={handleResponse}>
          <FormControlLabel value="Yes" control={<Radio />} label="Yes"/>
          <FormControlLabel value="No" control={<Radio />} label="No"/>
        </RadioGroup>
      </FormControl>
    </div>
  )
}