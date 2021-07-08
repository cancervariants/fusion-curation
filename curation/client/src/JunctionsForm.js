import { React } from 'react';
import { Box, FormLabel, TextField } from '@material-ui/core';

const JunctionsForm = ({
  junction5Prime, setJunction5Prime, junction3Prime, setJunction3Prime,
}) => {
  // TODO -- need to rewrite to be component based
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
};

export default JunctionsForm;
