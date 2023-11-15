import { Box, CircularProgress, makeStyles } from "@material-ui/core";
import React from "react";

interface LoadingMessageProps {
  message?: string;
}

export default function StrandSwitch(
  props: LoadingMessageProps
): React.ReactElement {
  const loadingMessage = props?.message ? props.message : "Loading..."
  return (
    <Box alignContent="center" alignItems="center" justifyContent="center" display="flex" flexDirection="column">
      <Box mb={2}>{loadingMessage}</Box>
        <CircularProgress />
    </Box>
  );
}
