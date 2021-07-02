import { React, Fragment, Component } from 'react';
import ReactDOM from 'react-dom';
import { Button, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup, TextField } from '@material-ui/core';

// TODO return to https://reactjs.org/docs/forms.html
// basically riff on this https://redux-form.com/8.2.2/examples/material-ui/

function RadioOption({ label }) {
  return (
    <FormControlLabel value={label.toLowerCase()} control={<Radio />} label={label} />
  );
}

class FormRadio extends Component {
  constructor(props) {
    super(props);
    this.prompt = props.prompt;
    this.options = props.options;
  }

  render() {
    return (
      <>
        <FormControl component="fieldset">
          <FormLabel component="legend">{this.prompt}</FormLabel>
          <RadioGroup aria-label="protein-coding" name="protein-coding">
            {
              this.options.map((item) => (
                <RadioOption key={item} label={item} />
              ))
            }
          </RadioGroup>
        </FormControl>
        <p />
      </>
    );
  }
}

function FormChimericJunction() {
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

function FormParent() {
  return (
    <>
      <FormRadio prompt="Is at least one partner protein-coding?" options={['Yes', 'No', 'Unknown']} />
      <FormRadio prompt="Is the reading frame predicted to be preserved?" options={['Yes', 'No']} />
      <FormRadio prompt="Record any predicted meaningful protein functional domains preserved and associated genes:" options={['TBD']} />
      <FormChimericJunction />
      <FormRadio prompt="Is causative event known?" options={['Yes', 'No']} />
      <FormRadio prompt="Record event type and associated structural variant information:" options={['TBD']} />
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
