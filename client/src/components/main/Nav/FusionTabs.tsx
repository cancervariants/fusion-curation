import { Box, Typography, makeStyles } from "@material-ui/core";
import React, { useContext } from "react";
import { FusionContext } from "../../../global/contexts/FusionContext";

const useStyles = makeStyles(() => ({
  fusionType: {
    marginRight: "0.5em",
    color: "white",
    fontWeight: "normal",
  },
}));

export default function FusionTabs(): React.ReactElement {
  const classes = useStyles()
  const { fusion, setFusion } = useContext(FusionContext);


  const fusionType = fusion.type === "CategoricalFusion" ? "Categorical Fusion" : "Assayed Fusion"
  const switchToType = fusion.type === "CategoricalFusion" ? "Assayed Fusion" : "Categorical Fusion"

  return (
    <div>
      <Box display="flex">
        <h2 className={classes.fusionType}>{fusionType}</h2>
        <Typography color="inherit" style={{ cursor: "pointer", margin: "auto" }} onClick={() => { setFusion({ ...fusion, type: switchToType.replace(/\s/g, "") }) }}>(Switch to {switchToType} tool?)</Typography>
      </Box>
    </div>
  )
}