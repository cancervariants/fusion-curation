import { Tooltip } from "@material-ui/core";
import React from "react";

const HelpTooltip = ({ title, placement, children }) => (
  <Tooltip
    enterDelay={250}
    placement={placement ? placement : "right"}
    title={title}
  >
    {children}
  </Tooltip>
);

export default HelpTooltip;
