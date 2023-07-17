import { makeStyles, TextField, Typography } from "@material-ui/core";
import React, { KeyboardEventHandler } from "react";
import HelpTooltip from "../HelpTooltip/HelpTooltip";

interface Props {
  fieldValue: string;
  valueSetter: CallableFunction;
  errorText: string;
  keyHandler: KeyboardEventHandler<HTMLDivElement> | undefined;
  width?: number | undefined;
}

const TranscriptField: React.FC<Props> = ({
  fieldValue,
  valueSetter,
  errorText,
  keyHandler,
  width,
}) => {
  const useStyles = makeStyles(() => ({
    textField: {
      width: width ? width : 125,
    },
  }));
  const classes = useStyles();

  return (
    <HelpTooltip
      placement="bottom"
      title={
        <Typography>
          RefSeq transcript identifier, e.g.{" "}
          <Typography variant="overline">NM_002529.3</Typography>.
        </Typography>
      }
    >
      <TextField
        margin="dense"
        value={fieldValue}
        onChange={(event) => valueSetter(event.target.value)}
        error={errorText != ""}
        onKeyDown={keyHandler}
        label="Transcript"
        helperText={errorText != "" ? errorText : null}
        className={classes.textField}
      />
    </HelpTooltip>
  );
};

export default TranscriptField;
