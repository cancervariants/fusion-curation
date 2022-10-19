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
  setStrand: (arg0: string) => void;
  selectedStrand: string;
}

export default function StrandSwitch(
  props: StrandSwitchProps
): React.ReactElement {
  const classes = useStyles();
  const { setStrand, selectedStrand } = props;
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStrand(e.target.checked ? "-" : "+");
  };

  return (
    <FormControlLabel
      control={
        <Switch
          onChange={handleSwitchChange}
          classes={{ track: classes.track }}
          checked={selectedStrand === "-"}
          icon={<AddCircleIcon color="primary" />}
          checkedIcon={<RemoveCircleIcon />}
          disableRipple
        />
      }
      label="Strand"
      labelPlacement="start"
      classes={{ label: classes.switchLabel }}
    />
  );
}
