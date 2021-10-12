import './Summary.scss'
import { FusionContext } from '../../../../global/contexts/FusionContext';
import React, { useContext, useState, useEffect } from 'react';
import {Button, Tabs, Tab} from '@material-ui/core/';
import { Readable } from '../Readable/Readable';
import { SummaryJSON } from '../JSON/SummaryJSON';
import { useColorTheme } from '../../../../global/contexts/Theme/ColorThemeContext';

import { Success } from '../Success/Success';

import {validateFusion} from '../../../../services/main';

interface Props {
  index: number
}


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
}




export const Summary: React.FC<Props> = ( { index }) => {

  const { colorTheme } = useColorTheme();

  const [value, setValue] = useState(0);

  const [saved, setSaved] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSubmit = () => {
    setSaved(true)
    validateFusion(fusion)
      .then(fusionResponse => {
        let {fusion, warnings} = fusionResponse
      })

  }
  
  let {fusion} = useContext(FusionContext);
  let genes = [];
  let proteinDomains = fusion.protein_domains || [];
  let regulatoryElements = fusion.regulatory_elements|| [];
  let transcriptComponents = fusion.transcript_components || [];
  let rFramePreserved = fusion.r_frame_preserved || null;
  let causativeEvent = fusion.causative_event || 'Unknown'

  //TODO: fix this mess. formatting transcript stuff

  // let transcriptGeneComponents = transcriptComponents.filter(obj => {
  //   return obj.component_type === 'gene'
  // })

  // let transcriptOthers = transcriptComponents.map(obj => {
  //   if(obj.component_type !== 'gene'){ 
  //     return obj.component_name
  //   }
  // })

  // let transcriptGenes = transcriptGeneComponents.map((comp, index) => {
  //   return (`${index ? '::' : ''}${comp.gene_descriptor.label}`);
  // })

  // transcriptGenes = transcriptGenes.join('').toUpperCase();

  // transcriptComponents = [transcriptGenes, ...transcriptOthers]

  let regElementGenes = regulatoryElements.map((el)  => {
    return (`, ${el.gene_descriptor.label}`);
  })

  

  // let genes = [...transcriptGenes, ...regElementGenes]

  return (
    <div className="summary-tab-container">
      <div className="summary-sub-tab-container">

        {
          (accepted || !saved) ? 
          <>
          <div className="summary-nav">
        <Tabs TabIndicatorProps={{style: {backgroundColor: colorTheme['--primary']}}} value={value} onChange={handleChange} centered>
        <Tab label="Summary" />
        <Tab label="JSON" />
      </Tabs>
        </div>

      <TabPanel value={value} index={0}>
        <div className="summary-sub-tab">
          <Readable 
          genes={genes} 
          proteinDomains={proteinDomains} 
          regulatoryElements={regulatoryElements} 
          transcriptComponents={transcriptComponents} 
          rFramePreserved={rFramePreserved}
          causativeEvent={causativeEvent}
        />
        </div>

      </TabPanel>
      <TabPanel value={value} index={1}>
      <div className="summary-sub-tab">
        <SummaryJSON 
          fusion={fusion}
        />
      </div>
      </TabPanel>

  
      <div className="save-button-container">
      <Button style={{width: '300px', marginTop: "30px"}} variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
      </div>
      </>
      : 
      <div className="success-confirmation">
        <Success setAccepted={setAccepted} />
      </div>
        }
        
      </div>
      
      
    </div>
  )
}
