import { Tooltip } from "@material-ui/core";
import React from "react";

const HelpTooltip = ({ title, placement, children }) => (
  <Tooltip placement={placement ? placement : "right"} title={title}>
    {children}
  </Tooltip>
);

export default HelpTooltip;
