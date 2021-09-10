import { useState, useContext } from 'react';
import {TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { GeneContext } from '../../../../contexts/GeneContext';


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
    <div>
      
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
        />      
      {genes.map((gene: string) => (    
          <p><button onClick={() => removeGene(gene)}>X</button> {gene}</p>
      ))}
      


    </div>
  )

}