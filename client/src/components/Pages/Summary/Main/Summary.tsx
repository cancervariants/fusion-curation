import './Summary.scss'
import { FusionContext } from '../../../../global/contexts/FusionContext';
import React, { useContext, useState, useEffect } from 'react';
import {Button, Tabs, Tab} from '@material-ui/core/';
import TabContext from '@mui/lab/TabContext';
import { Readable } from '../Readable/Readable';
import { SummaryJSON } from '../JSON/SummaryJSON';
import { makeStyles } from '@material-ui/core/styles';
import { useColorTheme } from '../../../../global/contexts/Theme/ColorThemeContext';



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

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  const {fusion} = useContext(FusionContext);

  const genes = fusion.genes || [];
  const proteinDomains = fusion.protein_domains || [];
  const regulatoryElements = fusion.regulatory_elements|| [];
  const transcriptComponents = fusion.transcript_components || [];

  return (
    <div className="summary-tab-container">
      <div className="summary-sub-tab-container">
        <div className="summary-nav">
        <Tabs TabIndicatorProps={{style: {backgroundColor: colorTheme['--primary']}}} value={value} onChange={handleChange} centered>
        <Tab label="Formatted" />
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
      <Button style={{width: '300px', marginTop: "30px"}} variant="contained" color="primary">Save</Button>
      </div>
      </div>
      
      
    </div>
  )
}
