import React, { useState } from "react";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";
import { Readable } from "../Readable/Readable";
import { Tabs, Tab } from "@material-ui/core/";
import { SummaryJSON } from "../JSON/SummaryJSON";
import { FusionType } from "../Main/Summary";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
};

interface Props {
  fusion: FusionType;
}

export const Success: React.FC<Props> = ({ fusion }) => {
  const [currentTab, setCurrentTab] = useState(0);

  const { colorTheme } = useColorTheme();

  const handleTabChange = (_, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <div className="summary-tab-container">
      <div className="summary-sub-tab-container">
        <div className="summary-nav">
          <Tabs
            TabIndicatorProps={{
              style: { backgroundColor: colorTheme["--primary"] },
            }}
            value={currentTab}
            onChange={handleTabChange}
            centered
          >
            <Tab label="Summary" />
            <Tab label="JSON" />
          </Tabs>
        </div>
        <TabPanel value={currentTab} index={0}>
          <div className="summary-sub-tab">
            {fusion && <Readable validatedFusion={fusion} />}
          </div>
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <div className="summary-sub-tab">
            {fusion && <SummaryJSON fusion={fusion} />}
          </div>
        </TabPanel>
      </div>
    </div>
  );
};
