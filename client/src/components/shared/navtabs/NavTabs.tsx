import React from 'react';
import {Transcript} from '../../pages/structure/Transcript';
import {RegElement} from '../../pages/regelement/RegElement';

import './NavTabs.scss'

//MUI Stuff
import { makeStyles, Theme } from '@material-ui/core/styles';
import {AppBar, Tabs, Tab, Box, Button} from '@material-ui/core';


interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}


function TabPanel(props: TabPanelProps) {

  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nav-tabpanel-${index}`}
      aria-labelledby={`nav-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
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

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function NavTabs() {
  

  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: unknown, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>

      <AppBar position="static">
        <Tabs
          variant="fullWidth"
          value={value}
          onChange={handleChange}
          aria-label="nav tabs example"
        >
          <LinkTab label="Chimeric Transcript" href="/drafts" {...a11yProps(0)}  />
          <LinkTab label="Regulatory Element" href="/trash" {...a11yProps(1)} />
          <LinkTab label="Domains" href="/spam" {...a11yProps(2)} />
          <LinkTab label="Cause" href="/spam" {...a11yProps(2)} />
          <LinkTab label="Summary" href="/spam" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} >    
        <Transcript index={1}/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <RegElement index={1}/>
      </TabPanel>
      <TabPanel value={value} index={2}>
        Page Three
      </TabPanel>

      <Button onClick={(event) => {handleChange(event, value - 1)}} variant="contained" color="primary">Previous</Button>
      <Button onClick={(event) => {handleChange(event, value + 1)}} variant="contained" color="primary">Next</Button>
    </div>
  );
}
