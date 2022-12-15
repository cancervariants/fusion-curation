import { makeStyles, Tooltip } from "@material-ui/core";
import React from "react";

const useStylesBootstrap = makeStyles(() => ({
  tooltip: {
    "& p": {
      fontSize: "0.875rem",
      lineHeight: "1.43",
    },
    "& p:not(:last-child)": {
      paddingBottom: "4px",
    },
  },
}));

const BootstrapTooltip = ({ title, placement, children }) => {
  const classes = useStylesBootstrap();

  return (
    <Tooltip
      enterDelay={250}
      placement={placement ? placement : "right"}
      title={title}
      classes={classes}
    >
      {children}
    </Tooltip>
  );
};

export default BootstrapTooltip;
