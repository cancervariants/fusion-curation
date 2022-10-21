import "./ReadingFrame.scss";
import { FusionContext } from "../../../global/contexts/FusionContext";
import React, { FormEvent, useContext, useEffect, useState } from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

interface Props {
  index: number;
}

// TODO merge theme with FormControl?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme) => ({
  formControl: {
    fontWeight: 300,
  },
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ReadingFrame: React.FC<Props> = ({ index }) => {
  const classes = useStyles();

  const { fusion, setFusion } = useContext(FusionContext);

  //TODO: do a useref here or something

  const assignRadioValue = (value: boolean) => {
    switch (value) {
      case true:
        return "yes";
      case false:
        return "no";
      default:
        return "unspecified";
    }
  };

  const [rFramePreserved, setRFramePreserved] = useState(
    assignRadioValue(fusion.r_frame_preserved)
  );

  useEffect(() => {
    if (
      fusion.r_frame_preserved &&
      fusion.r_frame_preserved !== rFramePreserved
    ) {
      setRFramePreserved(assignRadioValue(fusion.r_frame_preserved));
    }

    if (fusion.r_frame_preserved === undefined) {
      setFusion({ ...fusion, r_frame_preserved: null });
    }
  }, [fusion]);

  const handleRFrameChange = (event: FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    if (value !== rFramePreserved) {
      if (value === "yes") {
        setRFramePreserved("yes");
        setFusion({ ...fusion, r_frame_preserved: true });
      } else if (value === "no") {
        setRFramePreserved("no");
        setFusion({ ...fusion, r_frame_preserved: false });
      } else {
        setRFramePreserved("unspecified");
        setFusion({ ...fusion, r_frame_preserved: null });
      }
    }
  };

  return (
    <div className="reading-frame-tab-container">
      <FormControl component="fieldset">
        <h3>Is the reading frame expected to be preserved?</h3>
        <RadioGroup
          aria-label="Is the reading frame expected to be preserved?"
          name="controlled-radio-buttons-group"
          value={rFramePreserved}
          onChange={handleRFrameChange}
          className={classes.formControl}
        >
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
          <FormControlLabel
            value="unspecified"
            control={<Radio />}
            label="Unspecified"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};
