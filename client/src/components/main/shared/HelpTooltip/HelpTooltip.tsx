import { Box, makeStyles, Tooltip } from "@material-ui/core";
import React from "react";

const HelpTooltip = ({ title, placement, children }) => {
  const useStyles = makeStyles(() => ({
    tooltipContainer: {
      // TODO this isn't working?
      "& p": {
        fontSize: "0.875rem",
        lineHeight: "1.43",
      },
    },
  }));
  const classes = useStyles();

  return (
    <Tooltip
      enterDelay={250}
      placement={placement ? placement : "right"}
      title={title}
    >
      <Box className={classes.tooltipContainer}>{children}</Box>
    </Tooltip>
  );
};

export default HelpTooltip;
