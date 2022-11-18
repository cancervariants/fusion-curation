import { Typography } from "@material-ui/core";
import { styled } from "@material-ui/core/styles";

interface PopoverTypographyProps {
  children: React.ReactNode;
}

const StyledTypography = styled(Typography)({});

const PopoverTypography: React.FC<PopoverTypographyProps> = ({ children }) => (
  <StyledTypography variant="body2">{children}</StyledTypography>
);

export default PopoverTypography;
