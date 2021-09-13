
import React from 'react';
import {Structure} from '../../pages/Structure/Structure/Structure';
import {Gene} from '../../pages/Gene/Gene/Gene';
import {RegElement} from '../../pages/RegElement/RegElement/RegElement';

import './NavTabs.scss'

//MUI Stuff
import { makeStyles, Theme } from '@material-ui/core/styles';
import {AppBar, Tabs, Tab, Box, Button, Grid, Paper} from '@material-ui/core';
import { borderBottom } from '@material-ui/system';


interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}


function TabPanel(props: TabPanelProps) {

  const { children, value, index, ...other } = props;

  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nav-tabpanel-${index}`}
      aria-labelledby={`nav-tab-${index}`}
      {...other}
      style={{padding: 0, height: '100%', overflow: 'scroll'}}
    >
      {value === index && (
        <Box overflow="scroll" className={classes.box}>
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
  rootcontainer:{
    display:'flex',
  },
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '60vw',
    "& .MuiButtonBase-root" : {
      "& button:hover" :{
        
          outline: "none"
        
    }}
  
  },
  continue: {
    backgroundColor: theme.colors.navbutton,
    marginLeft: 'auto',
  },
  previous: {
    backgroundColor: theme.colors.navbutton,
  },
  indicator: {
    backgroundColor: theme.colors.navbutton,
  },
  footer:{
    borderTop:'1px solid #000',
    padding: '5px 15px',
  },
  tabpanel:{
    height: '60vh',
  },
  box:{
    minHeight: '100%',
  },
  enabledtabs:{
    backgroundColor: theme.colors.enabledtabs,
    color: '#878791',
    borderBottom: '1px solid #878791'
  },
  '&:focus': {
    outline: 'none',
  },
  appbar: {
    boxshadow: 'none',
    backgroundColor: '#878791'
  }
}));

export default function NavTabs() {
  

  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: unknown, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Grid container xs={12} justify="center" alignItems="center" className={classes.rootcontainer}>
    <div className={classes.root}>

      <AppBar className={classes.appbar} elevation={0} position="static">
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
          <LinkTab label="Cause" href="/spam" {...a11yProps(4)} />
          <LinkTab label="Summary" href="/spam" {...a11yProps(5)} />
        </Tabs>
      </AppBar>
      <Grid className={classes.tabpanel}>
        <TabPanel value={value} index={0} >    
          <Gene index={1}/>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Structure index={1}/>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <RegElement index={1}/>
        </TabPanel>
      </Grid>

      <Grid container xs={12} className={classes.footer} >
        { value !== 0 ? 
        <Button className={classes.previous} onClick={(event) => {handleChange(event, value - 1)}} variant="contained" color="primary">Back</Button>
        : null} 
        <Button className={classes.continue} onClick={(event) => {handleChange(event, value + 1)}} variant="contained" color="primary">Continue</Button>
      </Grid>
    </div>
    </Grid>
  );
}
