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
  handleDemo: (
    fusion: ClientAssayedFusion | ClientCategoricalFusion,
    userSelectedFusion: string
  ) => void;
  selectedDemo: string;
}

export default function DemoDropdown(
  props: DemoDropdownProps
): React.ReactElement {
  const classes = useStyles();
  const { handleClear, handleDemo, selectedDemo } = props;
  const demoIsSelected = selectedDemo && selectedDemo !== "none";

  const path = window.location.pathname;
  let demoData = assayedDemoList;
  if (path.includes("/categorical-fusion")) {
    demoData = categoricalDemoList;
  }

  const handleChange = (event) => {
    const value = event.target.value;
    // setSelectedDemo(value as string);
    if (value !== "none") {
      getDemoObject(value).then((demoObject) => {
        handleDemo(demoObject, value);
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
        {demoIsSelected ? (
          <MenuItem value="none">
            <em style={{ color: "black" }}>Clear</em>
          </MenuItem>
        ) : (
          <MenuItem value="none">
            <em style={{ color: `${demoIsSelected ? "black" : "grey"}` }}>
              Select demo...
            </em>
          </MenuItem>
        )}
        {demoData.map((el, index) => (
          <MenuItem key={index} value={el.endpoint}>
            {el.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
