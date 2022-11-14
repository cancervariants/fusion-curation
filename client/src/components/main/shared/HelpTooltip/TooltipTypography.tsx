import { Typography } from "@material-ui/core";
import { styled } from "@material-ui/core/styles";

const StyledTypography = styled(Typography)({
  padding: "4px 0 4px 0",
});

const TooltipTypography = ({ children }) => (
  <StyledTypography variant="body2">{children}</StyledTypography>
);

export default TooltipTypography;
