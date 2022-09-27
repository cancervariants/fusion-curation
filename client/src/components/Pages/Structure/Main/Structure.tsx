import { Box, FormControl, makeStyles, MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import Builder from "../Builder/Builder";
import "./Structure.scss";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { assayedDemoList, categoricalDemoList, getDemoObject } from "../../../../services/main";

interface Props {
  index: number;
  handleDemo: (fusion) => void;
}

const useStyles = makeStyles(() => ({
  demoMenu: {
    width: "200px",
    alignItems: "center",
  },
  demoMenuLabel: {
    marginLeft: "20px",
  },
}));

export const Structure: React.FC<Props> = (props: Props) => {
  const fusion = useContext(FusionContext).fusion;
  const classes = useStyles();
  const [selectedDemo, setSelectedDemo] = React.useState("");
  const demoIsSelected = selectedDemo && selectedDemo !== "none"
  const{ handleDemo } = props

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value
    setSelectedDemo(value as string);
    const demoObject = getDemoObject(value).then(
      demoObject => {
        console.log(demoObject)
        handleDemo(demoObject)
      }
    )
  };

  const path = window.location.pathname;
  let demoData = assayedDemoList
  if (path.includes("/categorical-fusion")) {
    demoData = categoricalDemoList
  }

  const demoDropdown = (
    <Box>
      <FormControl>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={selectedDemo ? selectedDemo : "none"}
          onChange={handleChange}
          className={classes.demoMenu}
        >
          <MenuItem value="none">
            <em style={{ color: `${demoIsSelected ? "black" : "grey"}` }}>{demoIsSelected ? "Clear" : "Select demo..."}</em>
          </MenuItem>
          {demoData.map((el) => (
            <MenuItem value={el.endpoint}>{el.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )

  return (
    <div className="structure-tab-container">
      <Box width="200px">
        {demoDropdown}
      </Box>
      <div className="structure-summary">
        <h3>Structure Overview</h3>
        <h5>
          Drag and rearrange elements.
          {
            // TODO -- how to interact w/ reg element count?
            fusion.structural_elements?.length +
              (fusion.regulatory_element !== undefined) >=
              2 ? null : (
              <span className="error-banner">
                Must provide at least 2 structural or regulatory elements.
              </span>
            )
          }
        </h5>
      </div>
      <Builder />
    </div>
  );
};
