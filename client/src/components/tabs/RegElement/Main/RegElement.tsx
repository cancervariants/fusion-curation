import React, {useState, useContext} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Close from '../../Domains/Main/Close';
import { FusionContext } from '../../../../global/contexts/FusionContext';

import './RegElement.scss'
import RegElementForm from '../RegElementForm/RegElementForm';

interface Props {
  index: number
}

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: '80%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export const RegElement: React.FC<Props> = ( { index }) => {
  const classes = useStyles();
  const [type, setType] = useState(null);
  const {fusion, setFusion} = useContext(FusionContext);

  const regElements = fusion["regulatory_elements"] || []; 

  const handleChange = (event) => {
    setType(event.target.value);
  };

  const handleRemove = (regEl) => {
    //copy regulatory elements array, then remove the element with the relevant ID
    let cloneArray = Array.from(fusion['regulatory_elements']);
    cloneArray = cloneArray.filter((obj) => {
      return obj["element_id"] !== regEl["element_id"]
    })
    setFusion({ ...fusion, ...{ "regulatory_elements" : cloneArray ? cloneArray : [] }})
  }

  return (
    <div className=".reg-element-tab-container">
      <div className="left">
        <div className="blurb-container">
          {
            regElements.length > 0 ?
            <div className="blurb">
              This transcript structure appears to be associated with a 
               {  
                regElements.map(regEl => (
                  <span className="bold">{regEl["gene_descriptor"]["label"]} {regEl["type"]}</span>
                ))  
                } Regulatory Element. 
            </div>
            :
            <div className="blurb">
              No regulatory element found. 
            </div>
          }
          <div className="sub-blurb">
          You can add or remove regulatory elements. 
          </div>
          
          { regElements.map(regEl => (
            <div className="regel">
              <span>{regEl["gene_descriptor"]["label"]} {regEl["type"]}</span>
              <span className="close-button-reg" onClick={() => handleRemove(regEl)}>
              <Close />
              </span>
            </div>
            ))  
            } 
            
            
        </div>

      </div>
      <div className="right">
      
      <RegElementForm/>

      </div>

    </div>
  )

}