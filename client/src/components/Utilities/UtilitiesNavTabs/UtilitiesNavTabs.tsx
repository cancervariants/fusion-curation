import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { AppBar, Tabs, Tab, Box, Paper } from "@material-ui/core";
import { useColorTheme } from "global/contexts/Theme/ColorThemeContext";
import GetCoordinates from "../GetCoordinates/GetCoordinates";
import GetSequence from "../GetSequence/GetSequence";
import { GetTranscripts } from "../GetTranscripts/GetTranscripts";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <Box
      height="100%"
      hidden={value !== index}
      // className="sub-tab"
      aria-labelledby={`nav-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  );
};

function a11yProps(index: number) {
  return {
    id: `nav-tab-${index}`,
    "aria-controls": `nav-tabpanel-${index}`,
  };
}

interface LinkTabProps {
  label?: string;
  href?: string;
}

const LinkTab = (props: LinkTabProps) => {
  return (
    <Tab
      component="a"
      onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
      }}
      {...props}
    />
  );
};

const UtilitiesNavTabs = (): React.ReactElement => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const useStyles = makeStyles((theme: Theme) => ({
    root: {
      backgroundColor: colorTheme["--white"],
    },
    utilitiesNavTabs: {
      backgroundColor: colorTheme["--white"],
    },
    utilitiesTabPanel: {
      minHeight: "66vh",
      margin: "1em 2em 0 2em",
    },
    continue: {
      backgroundColor: colorTheme["--primary"],
      marginLeft: "auto",
    },
    previous: {
      backgroundColor: colorTheme["--primary"],
    },
    indicator: {
      backgroundColor: colorTheme["--primary"],
    },
    footer: {
      padding: "15px",
      borderTop: `1px solid ${colorTheme["--light-gray"]}`,
    },
    enabledtabs: {
      backgroundColor: colorTheme["--tabs"],
      color: colorTheme["--dark-gray"],
      borderBottom: `1px solid ${colorTheme["--medium-gray"]}`,
    },
  }));

  const { colorTheme } = useColorTheme();
  const classes = useStyles();
  const [value, setValue] = React.useState(0); // current visible tab

  const handleChange = (event: unknown, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper className={classes.utilitiesNavTabs}>
      <AppBar elevation={0} position="static">
        <Tabs
          classes={{
            indicator: classes.indicator,
          }}
          variant="fullWidth"
          value={value}
          onChange={handleChange}
          aria-label="nav tabs example"
          className={classes.enabledtabs}
        >
          <LinkTab label="Get MANE Transcripts" {...a11yProps(0)} />
          <LinkTab label="Convert Coordinates" {...a11yProps(1)} />
          <LinkTab label="Sequence Lookup" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <Box className={classes.utilitiesTabPanel}>
        <TabPanel value={value} index={0}>
          <GetTranscripts />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <GetCoordinates />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <GetSequence />
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default UtilitiesNavTabs;
