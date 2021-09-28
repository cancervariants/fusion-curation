import React from 'react';

// Pages
import {Structure} from '../../tabs/Structure/Main/Structure';
import {Gene} from '../../tabs/Gene/Main/Gene';
import {RegElement} from '../../tabs/RegElement/Main/RegElement';
import { Summary } from '../../tabs/Summary/Main/Summary';
import { Domain } from '../../tabs/Domains/Main/Domain';

//MUI Stuff
import { makeStyles, Theme } from '@material-ui/core/styles';
import {AppBar, Tabs, Tab, Button,} from '@material-ui/core';

// Styles
import './NavTabs.scss'
import { useColorTheme  } from '../../../global/contexts/Theme/ColorThemeContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}


function TabPanel(props: TabPanelProps) {

  const { children, value, index, ...other } = props;

  return (
    <div
      hidden={value !== index}
      className="sub-tab"
      aria-labelledby={`nav-tab-${index}`}
      {...other}
    >
      {value === index && (
        <>
          {children}
        </>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `nav-tab-${index}`,
    'aria-controls': `nav-tabpanel-${index}`,
  };
}

interface LinkTabProps {
  label?: string;
  href?: string;
}

function LinkTab(props: LinkTabProps) {
  return (
    <Tab
      component="a"
      onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
      }}
      {...props}
    />
  );
}


export default function NavTabs() {
  
  const useStyles = makeStyles((theme: Theme) => ({
    root: {
      backgroundColor: colorTheme['--white'],
    
    },
    continue: {
      backgroundColor: colorTheme['--primary'],
      marginLeft: 'auto',
    },
    previous: {
      backgroundColor: colorTheme['--primary'],
    },
    indicator: {
      backgroundColor: colorTheme['--primary'],
    },
    footer:{
      padding: '15px',
      borderTop: `1px solid ${colorTheme['--light-gray']}`
    },
    enabledtabs:{
      backgroundColor: colorTheme['--tabs'],
      color: colorTheme['--medium-gray'],
      borderBottom: `1px solid ${colorTheme['--medium-gray']}`
    },
  }));
  
  
  const { colorTheme } = useColorTheme();

  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: unknown, newValue: number) => {
    setValue(newValue);
  };

  return (
    
    <div className="nav-tabs">

      <AppBar elevation={0} position="static">
        <Tabs
        classes={{
          indicator: classes.indicator
        }}
          variant="fullWidth"
          value={value}
          onChange={handleChange}
          aria-label="nav tabs example"
          className={classes.enabledtabs}
        >
          <LinkTab label="Gene" href="/drafts" {...a11yProps(0)}  />
          <LinkTab label="Structure" href="/drafts" {...a11yProps(1)}  />
          <LinkTab label="Regulatory Element" href="/trash" {...a11yProps(2)} />
          <LinkTab label="Domains" href="/spam" {...a11yProps(3)} />
          <LinkTab label="Summary" href="/spam" {...a11yProps(4)} />
        </Tabs>
      </AppBar>
      <div className="tab-panel">
        <TabPanel value={value} index={0} >    
          <Gene index={1}/>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Structure index={1}/>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <RegElement index={1}/>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Domain index={1}/>
        </TabPanel>
        <TabPanel value={value} index={4}>
          <Summary index={1}/>
        </TabPanel>
      </div>

      <div className="footer">

        { value !== 0 ? 
        <div className="previous">
          <Button className={classes.previous} onClick={(event) => {handleChange(event, value - 1)}} variant="contained" color="primary" >Back</Button>
        </div>  
        : null} 
        { value !== 4 ?
        <div className="continue">
           <Button style={{backgroundColor: colorTheme['--primary'], marginLeft: 'auto'}} onClick={(event) => {handleChange(event, value + 1)}} variant="contained" color="primary">Continue</Button>
        </div>
        : null}
      </div>
    </div>
  );
}