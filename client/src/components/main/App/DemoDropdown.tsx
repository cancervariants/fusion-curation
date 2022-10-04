import { FormControl, Select, MenuItem, makeStyles } from "@material-ui/core";
import React from "react";
import {
  assayedDemoList,
  categoricalDemoList,
  getDemoObject,
} from "../../../services/main";
import {
  ClientAssayedFusion,
  ClientCategoricalFusion,
} from "../../../services/ResponseModels";

const useStyles = makeStyles(() => ({
  demoMenu: {
    width: "200px",
    height: "40px",
    alignItems: "center",
    backgroundColor: "white",
    marginTop: "5px",
    marginRight: "5px",
  },
}));

interface DemoDropdownProps {
  handleClear: () => void;
  handleDemo: (fusion: ClientAssayedFusion | ClientCategoricalFusion) => void;
}

export default function DemoDropdown(
  props: DemoDropdownProps
): React.ReactElement {
  const classes = useStyles();
  const { handleClear, handleDemo } = props;
  const [selectedDemo, setSelectedDemo] = React.useState("");
  const demoIsSelected = selectedDemo && selectedDemo !== "none";

  const path = window.location.pathname;
  let demoData = assayedDemoList;
  if (path.includes("/categorical-fusion")) {
    demoData = categoricalDemoList;
  }

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedDemo(value as string);
    if (value !== "none") {
      getDemoObject(value).then((demoObject) => {
        handleDemo(demoObject);
      });
    } else if (value === "none") {
      handleClear();
    }
  };

  return (
    <FormControl variant="standard">
      <Select
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        value={selectedDemo ? selectedDemo : "none"}
        onChange={handleChange}
        className={classes.demoMenu}
      >
        <MenuItem value="none">
          <em style={{ color: `${demoIsSelected ? "black" : "grey"}` }}>
            Select demo...
          </em>
        </MenuItem>
        {demoData.map((el) => (
          <MenuItem value={el.endpoint}>{el.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
