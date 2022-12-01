import React, { useContext } from "react";

// Global fusion
import { FusionContext } from "../../../global/contexts/FusionContext";

// Pages
import { Structure } from "../../Pages/Structure/Main/Structure";
import { RegElement } from "../../Pages/RegElement/Main/RegElement";
import { Summary } from "../../Pages/Summary/Main/Summary";
import { Domain } from "../../Pages/Domains/Main/Domains";
import { ReadingFrame } from "../../Pages/ReadingFrame/ReadingFrame";
import { CausativeEvent } from "../../Pages/CausativeEvent/CausativeEvent";
import { Assay } from "../../Pages/Assay/Assay";

// MUI Stuff
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Tabs, Tab, Button } from "@material-ui/core";

// Styles
import "./NavTabs.scss";
import { useColorTheme } from "../../../global/contexts/Theme/ColorThemeContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      {value === index && <>{children}</>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `nav-tab-${index}`,
    "aria-controls": `nav-tabpanel-${index}`,
  };
}

interface LinkTabProps {
  label?: string;
  href?: string;
  disabled?: boolean;
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

interface NavTabsProps {
  handleClear: () => void;
}

export default function NavTabs(props: NavTabsProps): React.ReactElement {
  const { handleClear } = props;
  const { fusion } = useContext(FusionContext);
  const [visibleTab, setVisibleTab] = React.useState(0);

  const { colorTheme } = useColorTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const useStyles = makeStyles((theme: Theme) => ({
    root: {
      backgroundColor: colorTheme["--white"],
    },
    previous: {
      // backgroundColor: colorTheme["--primary"],
      padding: "1em 2em",
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
    demoMenu: {
      width: "200px",
      alignItems: "center",
    },
    demoMenuLabel: {
      marginLeft: "20px",
    },
  }));
  const classes = useStyles();

  const updateVisibleTab = (event: unknown, newIndex: number) => {
    setVisibleTab(newIndex);
  };

  return (
    <div className="nav-tabs">
      <div className="tabs">
        <Tabs
          classes={{
            indicator: classes.indicator,
          }}
          variant="fullWidth"
          value={visibleTab}
          onChange={updateVisibleTab}
          aria-label="nav tabs example"
          className={classes.enabledtabs}
        >
          <LinkTab
            label="Structure"
            href="/"
            disabled={fusion.type == null}
            {...a11yProps(1)}
          />
          <LinkTab
            label="Regulatory Element"
            href="/"
            disabled={fusion.type == null}
            {...a11yProps(2)}
          />
          {fusion.type === "CategoricalFusion" ? (
            <LinkTab label="Domain" href="/" {...a11yProps(3)} />
          ) : fusion.type === "AssayedFusion" ? (
            <LinkTab label="Event" href="/" {...a11yProps(3)} />
          ) : null}
          {fusion.type === "CategoricalFusion" ? (
            <LinkTab label="Reading Frame" href="/" {...a11yProps(4)} />
          ) : fusion.type === "AssayedFusion" ? (
            <LinkTab label="Assay" href="/" {...a11yProps(4)} />
          ) : null}
          <LinkTab
            label="Summary"
            href="/"
            disabled={fusion.type == null}
            {...a11yProps(5)}
          />
        </Tabs>
      </div>
      <div className="tab-panel">
        <TabPanel value={visibleTab} index={0}>
          <Structure index={0} />
        </TabPanel>
        <TabPanel value={visibleTab} index={1}>
          <RegElement index={1} />
        </TabPanel>
        <TabPanel value={visibleTab} index={2}>
          {fusion.type === "CategoricalFusion" ? (
            <Domain index={2} />
          ) : fusion.type === "AssayedFusion" ? (
            <CausativeEvent index={3} />
          ) : (
            <></>
          )}
        </TabPanel>
        <TabPanel value={visibleTab} index={3}>
          {fusion.type === "CategoricalFusion" ? (
            <ReadingFrame index={3} />
          ) : fusion.type === "AssayedFusion" ? (
            <Assay index={2} />
          ) : (
            <></>
          )}
        </TabPanel>
        <TabPanel value={visibleTab} index={4}>
          <Summary index={4} />
        </TabPanel>
      </div>

      <div className={`footer ${visibleTab !== 0 ? "with-prev" : ""}`}>
        {visibleTab !== 0 ? (
          <div className={classes.previous}>
            <Button
              onClick={(event) => updateVisibleTab(event, visibleTab - 1)}
              variant="contained"
              color="primary"
            >
              Back
            </Button>
          </div>
        ) : null}
        <div className="buttons">
          <Button
            className="clear-all"
            onClick={handleClear}
            variant="contained"
            color="secondary"
            disabled={!fusion.type}
          >
            Clear All
          </Button>
          <Button
            onClick={(event) => updateVisibleTab(event, visibleTab + 1)}
            variant="contained"
            color="primary"
            disabled={!fusion.type}
            style={{
              display: visibleTab === 4 ? "none" : "",
              marginLeft: "10px",
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
