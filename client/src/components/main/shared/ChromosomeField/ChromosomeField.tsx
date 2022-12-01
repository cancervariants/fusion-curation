import { makeStyles, TextField, Typography } from "@material-ui/core";
import React, { KeyboardEventHandler } from "react";
import HelpTooltip from "../HelpTooltip/HelpTooltip";

interface Props {
  fieldValue: string;
  valueSetter: CallableFunction;
  errorText: string;
  keyHandler: KeyboardEventHandler<HTMLDivElement> | undefined;
  width: number | undefined;
}

const ChromosomeField: React.FC<Props> = ({
  fieldValue,
  valueSetter,
  errorText,
  keyHandler,
  width,
}) => {
  const useStyles = makeStyles(() => ({
    textField: {
      height: 38,
      width: width ? width : 125,
    },
  }));
  const classes = useStyles();

  return (
    <HelpTooltip
      placement="bottom"
      title={
        <>
          <Typography>The chromosome on which the segment lies.</Typography>
          <Typography>
            RefSeq identifiers (e.g.{" "}
            <Typography variant="overline">NC_000001.11</Typography>) are
            preferred.
          </Typography>
        </>
      }
    >
      <TextField
        margin="dense"
        value={fieldValue}
        onChange={(event) => valueSetter(event.target.value)}
        error={errorText != ""}
        onKeyDown={keyHandler}
        label="Chromosome"
        helperText={errorText != "" ? errorText : null}
        className={classes.textField}
      />
    </HelpTooltip>
  );
};

export default ChromosomeField;
