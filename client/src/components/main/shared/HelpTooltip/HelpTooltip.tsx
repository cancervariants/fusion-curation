import { makeStyles, Tooltip } from "@material-ui/core";
import React, { useContext } from "react";
import { SettingsContext } from "../../../../global/contexts/SettingsContext";

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
  const settings = useContext(SettingsContext);

  const classes = useStylesBootstrap();

  return (
    <Tooltip
      enterDelay={250}
      placement={placement ? placement : "right"}
      title={title}
      classes={classes}
      disableFocusListener={!settings.enableToolTips}
      disableHoverListener={!settings.enableToolTips}
      disableTouchListener={!settings.enableToolTips}
    >
      {children}
    </Tooltip>
  );
};

export default BootstrapTooltip;
