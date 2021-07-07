import {
  React, Fragment, useState,
} from 'react';
import ReactDOM from 'react-dom';
import {
  Box, Button, Container, FormControl, FormLabel,
  FormControlLabel, Radio, RadioGroup, TextField, AppBar, Typography, Toolbar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

// TODO return to https://reactjs.org/docs/forms.html
// basically riff on this https://redux-form.com/8.2.2/examples/material-ui/

function RadioOption({ option, stateValue, stateFunction }) {
  return (
    <FormControlLabel
      value={option.toLowerCase()}
      control={<Radio />}
      label={option}
      onClick={() => stateFunction(stateValue, option)}
    />
  );
}

function FormRadio({ name, prompt, state }) {
  return (
    <Box p={1}>
      <FormControl component="fieldset">
        <FormLabel component="legend">{prompt}</FormLabel>
        <RadioGroup aria-label={name} name={name}>
          {
            state.options.map((option) => (
              <RadioOption
                key={option}
                option={option}
                stateValue={state.state}
                stateFunction={state.stateFunction}
              />
            ))
          }
        </RadioGroup>
      </FormControl>
      <p />
    </Box>
  );
}

function FormJunctions({
  junction5Prime, setJunction5Prime, junction3Prime, setJunction3Prime,
}) {
  // TODO this is just a mess
  function handle5PrimeChange(label, event) {
    if (label === "5' End Transcript") {
      setJunction5Prime({
        ...junction5Prime,
        transcript: event.target.value,
      });
    } else if (label === "5' End Exon Number") {
      setJunction5Prime({
        ...junction5Prime,
        exon_number: event.target.value,
      });
    } else if (label === "5' End Gene") {
      setJunction5Prime({
        ...junction5Prime,
        gene: event.target.value,
      });
    } else if (label === "5' End Chromosome") {
      setJunction5Prime({
        ...junction5Prime,
        chr: event.target.value,
      });
    } else if (label === "5' End Position") {
      setJunction5Prime({
        ...junction5Prime,
        pos: event.target.value,
      });
    }
  }

  function handle3PrimeChange(label, event) {
    if (label === "3' End Transcript") {
      setJunction3Prime({
        ...junction3Prime,
        transcript: event.target.value,
      });
    } else if (label === "3' End Exon Number") {
      setJunction3Prime({
        ...junction3Prime,
        exon_number: event.target.value,
      });
    } else if (label === "3' End Gene") {
      setJunction3Prime({
        ...junction3Prime,
        gene: event.target.value,
      });
    } else if (label === "3' End Chromosome") {
      setJunction3Prime({
        ...junction3Prime,
        chr: event.target.value,
      });
    } else if (label === "3' End Position") {
      setJunction3Prime({
        ...junction3Prime,
        pos: event.target.value,
      });
    }
  }

  return (
    <Box p={1}>
      <FormLabel component="legend">Record chimeric transcript junctions and associated genes:</FormLabel>
      <form noValidate autoComplete="off">
        {
          [
            [["5' End Transcript", "5' End Exon Number", "5' End Gene", "5' End Chromosome", "5' End Position"], handle5PrimeChange],
            [["3' End Transcript", "3' End Exon Number", "3' End Gene", "3' End Chromosome", "3' End Position"], handle3PrimeChange],
          ].map((row) => (
            <Box p={1} key={row[0][0]}>
              {
                row[0].map((item) => (
                  <TextField key={item} label={item} onChange={(event) => row[1](item, event)} />
                ))
              }
            </Box>
          ))
        }
      </form>
    </Box>
  );
}

function FormFunctionalDomains({ setRetainedDomains, setRetainedDomainGenes }) {
  function domainHandleChange(event) {
    setRetainedDomains(event.target.value);
  }

  function geneHandleChange(event) {
    setRetainedDomainGenes(event.target.value);
  }

  return (
    <>
      <Box p={1}>
        <FormLabel component="legend">Record predicted meaningful protein functional domains preserved:</FormLabel>
        <form noValidate autoComplete="off" onChange={domainHandleChange}>
          <TextField />
        </form>
      </Box>
      <Box p={1}>
        <FormLabel component="legend">Record associated genes:</FormLabel>
        <form noValidate autoComplete="off" onChange={geneHandleChange}>
          <TextField />
        </form>
      </Box>
    </>
  );
}

function CausEventInfo() {
  return (
    <>
      <Box p={1}>
        <form noValidate autoComplete="off">
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Record event type:
            </FormLabel>
            <RadioGroup aria-label="event-type" name="event-type">
              <FormControlLabel value="rearrangement" control={<Radio />} label="Rearrangement" />
              <FormControlLabel value="read-through" control={<Radio />} label="Read-through" />
              <FormControlLabel value="trans-splicing" control={<Radio />} label="Trans-splicing" />
            </RadioGroup>
          </FormControl>
        </form>
      </Box>
    </>
  );
}

function Submit({ handler }) {
  return (
    <Box p={1}>
      <Button variant="contained" color="primary" onClick={handler}>Submit</Button>
    </Box>
  );
}

function Response({ jsonValue, readableValue }) {
  return (
    <>
      <Box p={1}>
        <TextField
          id="response-json"
          label="JSON"
          multiline
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
          value={jsonValue}
          style={{ width: 700 }}
        />
      </Box>
      <Box p={1}>
        <TextField
          id="response-hgvs"
          label="HGVS-like"
          multiline
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
          value={readableValue}
          style={{ width: 700 }}
        />
      </Box>
    </>
  );
}

function FormParent() {
  // visibility handlers
  const [showRfPreserved, setShowRfPreserved] = useState(false);
  const [showFuncDomains, setShowFuncDomains] = useState(false);
  const [showJunctions, setShowJunctions] = useState(false);
  const [showCausEvent, setShowCausEvent] = useState(false);
  const [showCausEventInfo, setShowCausEventInfo] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  // form value handlers
  const [proteinCodingValue, setProteinCodingValue] = useState(null);
  const [rfPreserved, setRfPreserved] = useState(null);
  const [retainedDomains, setRetainedDomains] = useState(''); // TODO switch to array
  const [retainedDomainsGenes, setRetainedDomainGenes] = useState(''); // TODO switch to array
  const [junction5Prime, setJunction5Prime] = useState({});
  const [junction3Prime, setJunction3Prime] = useState({});
  const [causEvent, setCausEvent] = useState(null);
  const [responseJSON, setResponseJSON] = useState('');
  const [responseHuman, setResponseReadable] = useState('');

  const handleSetProteinCoding = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setProteinCodingValue(newValue);
      if (newValue === 'Yes') {
        setShowFuncDomains(false);
        setShowRfPreserved(true);
      } else if (newValue === 'No' || newValue === 'Unknown') {
        setShowRfPreserved(false);
        setShowFuncDomains(true);
        setShowCausEvent(true);
      }
    }
  };

  const handleSetRfPreserved = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setRfPreserved(newValue);
      if (newValue === 'Yes') {
        setShowFuncDomains(true);
        setShowJunctions(true);
        setShowCausEvent(true);
      } else if (newValue === 'No') {
        setShowFuncDomains(false);
        setShowJunctions(true);
        setShowCausEvent(true);
      }
    }
  };

  const handleSetCausEvent = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setCausEvent(newValue);
      if (newValue === 'Yes') {
        setShowCausEventInfo(true);
        setShowSubmit(true);
      } else if (newValue === 'No') {
        setShowCausEventInfo(false);
        setShowSubmit(true);
      } else {
        setShowCausEventInfo(false);
        setShowSubmit(false);
      }
    }
  };

  const handleSubmit = () => {
    // setResponseJSON('asldkjsdaf');
    // setResponseReadable('werowerouxc');
    const jsonOutput = {};
    if (proteinCodingValue === 'Yes') {
      if (rfPreserved === 'Yes') {
        jsonOutput.r_frame_preserved = true;
        if (retainedDomains !== '') {
          const domain = {
            domain_name: retainedDomains,
          };
          if (retainedDomainsGenes !== '') {
            domain.gene = retainedDomainsGenes;
          }
          jsonOutput.retainedDomains = [domain];
        }
      } else if (rfPreserved === 'No') {
        jsonOutput.r_frame_preserved = false;
      }
    }

    // TODO junctions:
    // * gene sub-object (get id)
    // * genomic_coordinate sub-object (chr, position)
    if (Object.keys(junction5Prime).length > 0) {
      jsonOutput['5_prime_end'] = junction5Prime;
    }
    if (Object.keys(junction3Prime).length > 0) {
      jsonOutput['3_prime_end'] = junction3Prime;
    }

    if (causEvent) {
      jsonOutput.causative_event = {
        event_type: causEvent,
      };
    }

    setResponseJSON(JSON.stringify(jsonOutput, null, 2));
    setResponseReadable('tbd');
    setShowResponse(true);
  };

  return (
    <>
      <FormRadio
        name="protein-coding"
        prompt="Is at least one partner protein-coding?"
        state={{
          options: ['Yes', 'No', 'Unknown'],
          state: proteinCodingValue,
          stateFunction: handleSetProteinCoding,
        }}
      />
      {showRfPreserved
        ? (
          <FormRadio
            name="rf-preserved"
            prompt="Is the reading frame predicted to be preserved?"
            state={{
              options: ['Yes', 'No'],
              state: rfPreserved,
              stateFunction: handleSetRfPreserved,
            }}
          />

        )
        : null}
      {showFuncDomains
        ? (
          <FormFunctionalDomains
            setRetainedDomains={setRetainedDomains}
            setRetainedDomainGenes={setRetainedDomainGenes}
          />
        )
        : null}
      {showJunctions
        ? (
          <FormJunctions
            junction5Prime={junction5Prime}
            setJunction5Prime={setJunction5Prime}
            junction3Prime={junction3Prime}
            setJunction3Prime={setJunction3Prime}
          />
        )
        : null}
      {showCausEvent
        ? (
          <FormRadio
            name="causative-event"
            prompt="Is causative event known?"
            state={{
              options: ['Yes', 'No'],
              state: causEvent,
              stateFunction: handleSetCausEvent, // TODO
            }}
          />
        )
        : null}
      {showCausEventInfo ? <CausEventInfo /> : null}
      {showSubmit ? <Submit handler={handleSubmit} /> : null}
      {showResponse
        ? <Response jsonValue={responseJSON} readableValue={responseHuman} />
        : null}
    </>
  );
}

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
}));

function Page() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Container maxWidth="md">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Gene Fusion Curation
            </Typography>
          </Toolbar>
        </AppBar>
        <Box boxShadow={1}>
          <FormParent />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        </Box>
      </Container>
    </div>
  );
}

ReactDOM.render(
  <Page />,
  document.getElementById('root'),
);
