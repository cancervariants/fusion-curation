import { React, Fragment, Component, useState } from 'react';
import ReactDOM from 'react-dom';
import { FormControl, FormLabel, FormControlLabel, Radio, RadioGroup, TextField } from '@material-ui/core';

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
    <>
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
    </>
  );
}

function FormJunctions() {
  return (
    <>
      <FormLabel component="legend">Record chimeric transcript junctions and associated genes:</FormLabel>
      <form noValidate autoComplete="off">
        {
          [
            "5' End Transcript", "5' End Exon Number", "5' End Gene", "5' End Chromosome", "5' End Position",
            "3' End Transcript", "3' End Exon Number", "3' End Gene", "3' End Chromosome", "3' End Position",
          ].map((item) => (
            <TextField key={item} label={item} />
          ))
        }
      </form>
    </>
  );
}

function FormFunctionalDomains() {
  return (
    <div id="record-functional-domains">
      <FormLabel component="legend">Record predicted meaningful protein functional domains preserved:</FormLabel>
      <form noValidate autoComplete="off">
        <TextField />
      </form>
      <FormLabel component="legend">Record associated genes:</FormLabel>
      <form noValidate autoComplete="off">
        <TextField />
      </form>
    </div>
  );
}

function CausEventInfo() { // TODO keep working here
  return (
    <>
      <form noValidate autoComplete="off">
        <FormLabel component="legend">Record predicted meaningful protein functional domains preserved and associated genes:</FormLabel>
        <TextField />
      </form>
    </>
  );
}

function FormParent() {
  const [showRfPreserved, setShowRfPreserved] = useState(false);
  const [showFuncDomains, setShowFuncDomains] = useState(false);
  const [showJunctions, setShowJunctions] = useState(false);
  const [showCausEvent, setShowCausEvent] = useState(false);
  const [showCausEventInfo, setShowCausEventInfo] = useState(false);

  const [proteinCodingValue, setProteinCodingValue] = useState(null);
  const [rfPreserved, setRfPreserved] = useState(null);
  const [causEvent, setCausEvent] = useState(null);

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
      setShowCausEvent(newValue);
      if (newValue === 'Yes') {
        setShowCausEventInfo(true);
      } else {
        setShowCausEventInfo(false);
      }
    }
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
      { showRfPreserved
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
      { showFuncDomains ? <FormFunctionalDomains /> : null }
      { showJunctions ? <FormJunctions /> : null }
      { showCausEvent
        ? (
          <FormRadio
            name="causative-event"
            prompt="Is causative event known?"
            state={{
              options: ['Yes', 'No'],
              state: rfPreserved,
              stateFunction: handleSetCausEvent, // TODO
            }}
          />
        )
        : null}
      { showCausEventInfo ? <CausEventInfo /> : null }
      {/* { showCausEventInfo
        ? (
          <FormRadio
            name="causative-event-type"
            prompt="Select event type:"
            state={{
              options: ['Rearrangement', 'Read-through', 'Trans-splicing'],
              state: rfPreserved,
              stateFunction: handleSetRfPreserved,
            }}
          />
        )
        : null} */}
              {/* <FormRadio name="causative-event" prompt="Is causative event known?" options={['Yes', 'No']} />
      <FormRadio name="event-type" prompt="Select event type:" options={['Rearrangement', 'Read-through', 'Trans-splicing']} />
      <FormRadio name="sv-info" prompt="Record structural variant information" options={['TBD']} /> */}
    </>
  );
}

ReactDOM.render(
  <div>
    <h3>Gene Fusion Curation</h3>
    <FormParent />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
  </div>,
  document.getElementById('root'),
);
