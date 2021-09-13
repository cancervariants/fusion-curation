import { useState, useContext } from 'react';
import {TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import Close from './Close';
import { GeneContext } from '../../../../contexts/GeneContext';

import './GeneSearch.scss'

import { GeneResults } from '../GeneResults/GeneResults';

//TODO: replace dummy data with server data

export const GeneSearch: React.FC = () => {

  const {genes, setGenes} = useContext(GeneContext);
  const [structures, setStructures] = useState([]);

  const removeGene = (gene: string) => {
    setGenes([]);
  }


  // const [geneList, setGeneList] = useState([]);

  // const getGeneList = async (query: string) => {
  //   const res = await fetch(`/gene_matches/${query}`);
  //   const data = await res.json();
  //   setGeneList(data.matches);
  // };

  // const onSelectGene = (value: string | null) => {
  //   setGenes({...genes, value})
  // }

  return (
    <div className="gene-search">
      
      {/* <Autocomplete
          id="domain-lookup"
          options={geneList}
          getOptionLabel={(option) => option}
          style={{ width: 300 }}
          onChange={(event, value) => onSelectGene(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label=""
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === '') {
                  setGeneList([]);
                  return;
                }
                getGeneList(event.target.value);
              }}
            />
          )}
        /> */}
        Add genes
        <TextField
          label=""
          variant="outlined"
          inputProps={{
            style: {
              padding: 5,
              width: '300px'
            }
         }}
        />

      <ul className="selected-genes">
        {genes.map((gene: string) => (    
            <li><span onClick={() => removeGene(gene)}><Close /></span> {gene}</li>
        ))}     
      </ul>      

      


    </div>
  )

}