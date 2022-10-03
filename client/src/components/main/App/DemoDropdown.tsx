import { Box, FormControl, Select, MenuItem, makeStyles, Theme } from "@material-ui/core";
import React from "react";
import { assayedDemoList, categoricalDemoList, getDemoObject } from "../../../services/main";

const useStyles = makeStyles((theme: Theme) => ({
  demoMenu: {
    width: "200px",
    alignItems: "center",
  },
  demoMenuLabel: {
    marginLeft: "20px",
  },
}));

interface DemoDropdownProps {
  handleClear: () => void;
  handleDemo: (fusion) => void;
}

export default function DemoDropdown(props: DemoDropdownProps): React.ReactElement {
  const classes = useStyles();
  const { handleClear, handleDemo } = props
  const [selectedDemo, setSelectedDemo] = React.useState("");
  const demoIsSelected = selectedDemo && selectedDemo !== "none"

  const path = window.location.pathname;
  let demoData = assayedDemoList
  if (path.includes("/categorical-fusion")) {
    demoData = categoricalDemoList
  }

  const handleChange = (event) => {
    const value = event.target.value
    setSelectedDemo(value as string);
    if (value !== "none") {
      getDemoObject(value).then(
        demoObject => {
          handleDemo(demoObject)
        }
      )
    } else if (value === "none") {
      handleClear()
    }
  };

  return (
    <Box>
      <FormControl variant="filled">
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={selectedDemo ? selectedDemo : "none"}
          onChange={handleChange}
          className={classes.demoMenu}
        >
          <MenuItem value="none">
            <em style={{ color: `${demoIsSelected ? "black" : "grey"}` }}>Select demo...</em>
          </MenuItem>
          {demoData.map((el) => (
            <MenuItem value={el.endpoint}>{el.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}