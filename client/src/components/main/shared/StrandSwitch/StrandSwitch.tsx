import { makeStyles, FormControlLabel, Switch } from "@material-ui/core";
import React from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

const useStyles = makeStyles({
  switchLabel: {
    color: "rgba(0, 0, 0, 0.54)",
  },
  track: {
    backgroundColor: "grey !important",
    marginTop: "2px",
  },
});

interface StrandSwitchProps {
  setStrand: (strand: string) => void;
  selectedStrand: string;
  switchClasses?;
}

export default function StrandSwitch(
  props: StrandSwitchProps
): React.ReactElement {
  const classes = useStyles();
  const { selectedStrand, switchClasses } = props;

  return (
    <FormControlLabel
      control={
        <Switch
          classes={{ track: classes.track }}
          checked={selectedStrand === "-"}
          icon={<AddCircleIcon color="primary" />}
          checkedIcon={<RemoveCircleIcon color="primary" />}
          disableRipple
        />
      }
      label="Strand"
      labelPlacement="start"
      classes={{ label: classes.switchLabel, ...switchClasses }}
    />
  );
}
