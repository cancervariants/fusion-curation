import React, {useState, useContext} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Card, CardActionArea, TextField, CardContent, Typography, Button } from '@material-ui/core';
import { ResponsesContext } from '../../../../contexts/ResponsesContext';

interface Props {
  title: string,
  inputs: string[],
}

const useStyles = makeStyles({
});

export const CTInput: React.FC<Props> = ({title, inputs}) => {
  const classes = useStyles();

  const [front, setFront] = useState(true);

  // global state
  const {responses, setResponses} = useContext(ResponsesContext);

  const handleSave = () => {
    setResponses({...responses, ...{[title]: ctComponents}})
    console.log(responses);
  }

  // controlled component
  const [ctComponents, setCtComponents] = useState({});
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>, input: string) => {
    setCtComponents({...ctComponents, ...{[input]: event.target.value}})
  }

  const flip = () => {
    setFront(!front);
  }

  return (
    <>
    { front 
      ? (
        <Card>
        <CardActionArea onClick={flip}>
          <CardContent>
            <Typography>
              Add {title}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    ) : (
      <Card >
        <CardContent>
          <Typography>
            {title}
          </Typography>
          {
            inputs.map(input => {
              return <TextField key={input} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {handleInput(event, input)}} id="outlined-basic" label={input} variant="outlined" />
            })
          }
          <Button variant="outlined" color="secondary" onClick={flip}>Cancel</Button>
          <Button variant="outlined" color="primary" onClick={handleSave}>Save</Button>
        </CardContent>
      </Card>
    )
    }
    </>
  )
}