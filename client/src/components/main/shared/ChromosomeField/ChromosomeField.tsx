import { makeStyles, TextField, Typography } from "@material-ui/core";
import React, { ChangeEvent } from "react";
import HelpTooltip from "../HelpTooltip/HelpTooltip";

interface Props {
  fieldValue: string;
  width?: number | undefined;
  editable?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const ChromosomeField: React.FC<Props> = ({ fieldValue, width, onChange }) => {
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
        label="Chromosome"
        onChange={onChange}
        className={classes.textField}
      />
    </HelpTooltip>
  );
};

export default ChromosomeField;
