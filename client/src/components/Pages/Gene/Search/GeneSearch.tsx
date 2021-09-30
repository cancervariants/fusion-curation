import React, { useState, useContext, useEffect } from 'react';
import { SuggestionContext } from '../../../../global/contexts/SuggestionContext';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import {TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

// Styles
import './GeneSearch.scss'

// SVG
import Close from './Close';


export const GeneSearch: React.FC = () => {
  
  const useStyles = makeStyles((theme) => ({
    root: {
      "& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
        transform: "translate(34px, 20px) scale(1);",
        outline: 'none',
      },
      '& .MuiFormLabel-root.Mui-disabled': {
        color: "rgba(0, 0, 0, 0.87)"
      },

    },
    'svg.MuiSvgIcon-root': {
      display: 'none'
    },
    inputRoot: {
      // color: "purple",
      // '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input:first-child': {
      //   paddingLeft: 26
      // },
      // "& .MuiOutlinedInput-notchedOutline": {
      //   borderColor: "green"
      // },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        border: "solid rgba(0, 0, 0, 0.4)",
        borderWidth: ".5px",
        boxSizing: "border-box",
        outline: "0px",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        border: "solid rgba(0, 0, 0, 0.4)",
        borderWidth: ".5px",
        boxSizing: "border-box",
        outline: "0px",
      },
      "& .Mui-focused": {
        color: "rgba(0, 0, 0, 0.8)", 
      },
    }
  }));

  const classes = useStyles();


  // entered by user in search
  const [genes, setGenes] = useState([]);

  // API response
  const [suggestions, setSuggestions] = useContext(SuggestionContext);

  // autocomplete
  const [open, setOpen] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("");


  const getData = () => {
    fetch('http://localhost:9000/suggestions'
    ,{
      method: "GET",
      mode: "cors",
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
    }
    )
      .then(function(response){
        console.log(response)
        return response.json();
      })
      .then(function(myJson) {
        // really should have search button, then check for presence of genes in objects
        if(genes.length === 2){
          setSuggestions([...suggestions, myJson[0]])
        }     
        return;   
      });
  }

  useEffect(() => {
    if(genes.length === 1){
      return
    }
    // setFusion({ ...fusion, ...{ "genes" : genes }})
    getData()
  }, [genes])

  // AUTOCOMPLETE METHODS
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleOpen = () => {
    if (inputValue.length > 0) {
      setOpen(true);
    }
  };

  const removeGene = (gene: string) => {
    setGenes([]);
  }

  // const onSelectGene = (value) => {
  //   setGenes([...genes, value]);
  //   resetter();
  // }

  const resetter = () => {
    setInputValue('');
    setOpen(false);
  }

  useEffect(() => {
    setInputValue('');
    setOpen(false);

    // dumb hack for demoing because it kept re-opening when clicking outside
    // need to clear the list of suggestions after selecting an option (onBlur?)
    genes.length === 2 ? setDisabled(true) : setDisabled(false);
  }, [genes]);


  return (
    <div className="gene-search">

<Autocomplete
      freeSolo={false}
      popupIcon={""}
      clearOnBlur={true}
      autoHighlight={false}
      autoSelect={true}
      open={open}
      disabled={disabled}
      classes={{inputRoot: classes.inputRoot}}
      onOpen={handleOpen}
      onClose={() => resetter()}
      inputValue={inputValue}
      onChange={(event: any, newValue) => {
        
          if (newValue === null) {
            setInputValue('');
          } else {
            setGenes([...genes, newValue])
          }

      }}
      onInputChange={handleInputChange}
      options={tempGeneList}
      getOptionLabel={option => option}
      style={{ width: 300 }}
      renderInput={params => (
        <TextField {...params} label={inputValue=== "" ? "Search Genes" : ""} InputLabelProps={{shrink: false }} className={classes.inputRoot} variant="outlined" 
        />
      )}
/>

        <div className="selected-parent">
          &nbsp;
        
        { genes &&  
          <ul className="selected-genes">
            {genes.map((gene: string) => (    
                <li><span onClick={() => removeGene(gene)}><Close /></span> {gene}</li>
            ))}     
        </ul>   
      }
        </div>
      
    </div>
  )

}

const tempGeneList = [
  'BCR', 'BRAF', 'ALK', 'BCL2', 'BCCT', 'BCL2L1', 'BcsC', 'BcsE', 'BcsQ', 'ABCB1', 'ABL1', 'ABCB1', 'ABLIM1', 'ABLIM2', 'ABLIM3', 'ABL2', 'MYC', 'Myoglobin', 'Myosin-8', 'Myosin-9', 'MYLK', 'MYCN', 'MYD88', 'MYBPC3', 'INC', 'IL6', "Insulin A chain", 'Interleukin-2', 'IGHG1', 'IKZF1', 'IL1B', 'IFNG', 'INSR', 'IGF1', 'IGF1R', 'IGHM', 'IGLL5', 'IGH', 'IGHE', 'IGFBP3'  
];