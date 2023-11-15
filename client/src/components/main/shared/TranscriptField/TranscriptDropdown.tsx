import { makeStyles, TextField, Typography } from "@material-ui/core";
import React, { KeyboardEventHandler } from "react";
import HelpTooltip from "../HelpTooltip/HelpTooltip";

interface Props {
  fieldValue: string;
  valueSetter: CallableFunction;
  errorText: string;
}

const TranscriptDropdown: React.FC<Props> = ({
  fieldValue,
  valueSetter,
  errorText,
}) => {
  const useStyles = makeStyles(() => ({
    textField: {
    },
  }));
  const classes = useStyles();

  return (
    <></>
  );
};

export default TranscriptDropdown;
