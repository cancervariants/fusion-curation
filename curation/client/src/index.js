import { React, Fragment, Component } from 'react';
import ReactDOM from 'react-dom';
import { Button, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';

// TODO return to https://reactjs.org/docs/forms.html

function RadioOption(props) {
  return (
    <FormControlLabel value={props.label.toLowerCase()} control={<Radio />} label={props.label} />
  )
}

class YesNoForm extends Component {
  constructor(props) {
    super(props);
    this.prompt = props.prompt;
    this.options = props.options;
  }

  render() {
    return (
      <Fragment>
        <FormControl component="fieldset">
          <FormLabel component="legend">{this.prompt}</FormLabel>
          <RadioGroup aria-label="protein-coding" name="protein-coding">
            {
              this.options.map(item => (
                <RadioOption key={item} label={item} />
              ))
            }
          </RadioGroup>
        </FormControl>
        <p></p>
      </Fragment>
    )
  }
}

class FormParent extends Component {
  render() {
    return (
      <Fragment>
        <YesNoForm prompt="Is at least one partner protein-coding?" options={["Yes", "No", "Unknown"]} />
        <YesNoForm prompt="Is the reading frame predicted to be preserved?" options={["Yes", "No"]} />
        <YesNoForm prompt="Record any predicted meaningful protein functional domains preserved and associated genes:" options={["TBD"]} />
        <YesNoForm prompt="Record chimeric transcript junctions and associated genes: " options={["TBD"]} />
        <YesNoForm prompt="Is causative event known?" options={["Yes", "No"]} />
        <YesNoForm prompt="Record event type and associated structural variant information:" options={["TBD"]} />
      </Fragment>
    )
  }
}


// ========================================

ReactDOM.render(
  <div>
    <h3>Gene Fusion Curation</h3>
    <FormParent />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
  </div>,
  document.getElementById('root')
);