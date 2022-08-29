import { Tab, Tabs } from "@material-ui/core";
import React, { useContext } from "react";
import { FusionContext } from "../../../global/contexts/FusionContext";
import NavTabs from "./NavTabs";

export default function FusionTabs(): React.ReactElement {
  const { fusion, setFusion } = useContext(FusionContext);
  const [fusionType, setFusionType] = React.useState("AssayedFusion");

  const handleChange = (event, newValue: string) => {
    setFusionType(newValue);
    if (newValue !== fusionType) {
      setFusionType(newValue);
      setFusion({ ...fusion, type: newValue });
    }
  };

  return (
    <div>
      <Tabs value={fusionType} onChange={handleChange}>
        <Tab label="Assayed Fusion" value='AssayedFusion'></Tab>
        <Tab label="Categorical Fusion" value='CategoricalFusion'></Tab>
      </Tabs>
      <NavTabs />
    </div>
  )
}