import React, { useState, useContext, useEffect } from 'react';
import {TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import Close from './Close';
import { GeneContext } from '../../../../global/contexts/GeneContext';

import { makeStyles, Theme } from '@material-ui/core/styles';


import './GeneSearch.scss'

import { GeneResults } from '../GeneResults/GeneResults';

//TODO: replace dummy data with server data



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


  const {genes, setGenes} = useContext(GeneContext);
  const [structures, setStructures] = useState([]);


  const [geneList, setGeneList] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("");
  const [reset, setReset] = useState(0)

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


  const onSelectGene = (value) => {
    setGenes({...genes, value});
    resetter();
  }

  const resetter = () => {
    setInputValue('');
    setOpen(false);

  }

  useEffect(() => {
    let count = reset;
    setReset(count++);
    setInputValue('');
    setOpen(false);

    genes.length === 2 ? setDisabled(true) : setDisabled(false);
  }, [genes]);

  return (
    <div className="gene-search">

    {/* <span>Add genes</span> */}
<Autocomplete
      id="combo-box-demo"
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
      options={top100Films}
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


// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
const top100Films = [
  'BCR', 'BCL2', 'BCCT', 'BCL2L1', 'BcsC', 'BcsE', 'BcsQ', 'ABCB1', 'ABL1', 'ABCB1', 'ABLIM1', 'ABLIM2', 'ABLIM3', 'ABL2', 'MYC', 'Myoglobin', 'Myosin-8', 'Myosin-9', 'MYLK', 'MYCN', 'MYD88', 'MYBPC3', 'INC', 'IL6', "Insulin A chain", 'Interleukin-2', 'IGHG1', 'IKZF1', 'IL1B', 'IFNG', 'INSR', 'IGF1', 'IGF1R', 'IGHM', 'IGLL5', 'IGH', 'IGHE', 'IGFBP3'  
];