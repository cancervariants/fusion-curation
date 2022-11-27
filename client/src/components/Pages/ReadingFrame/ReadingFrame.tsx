import "./ReadingFrame.scss";
import { FusionContext } from "../../../global/contexts/FusionContext";
import React, { FormEvent, useContext, useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { HelpPopover } from "../../main/shared/HelpPopover/HelpPopover";

interface Props {
  index: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ReadingFrame: React.FC<Props> = ({ index }) => {
  // TODO merge theme with FormControl?
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const useStyles = makeStyles((theme) => ({
    formControl: {
      fontWeight: 300,
    },
    prompt: {
      margin: "40px 0 20px 0",
    },
    inputField: {
      margin: "20px 0 40px 0",
    },
  }));
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
        <Typography variant="h5" className={classes.prompt}>
          Is the reading frame expected to be preserved?
          <HelpPopover>
            <Box>
              <Typography>
                A common attribute of a categorical gene fusion is whether the
                reading frame is preserved in the expressed gene product. This
                is typical of protein-coding gene fusions.
              </Typography>
              <Typography>
                See the{" "}
                <Link href="https://fusions.cancervariants.org/en/latest/information_model.html#functional-domains">
                  specification
                </Link>{" "}
                for more information.
              </Typography>
            </Box>
          </HelpPopover>
        </Typography>
        <Box className={classes.inputField}>
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
        </Box>
      </FormControl>
    </div>
  );
};
