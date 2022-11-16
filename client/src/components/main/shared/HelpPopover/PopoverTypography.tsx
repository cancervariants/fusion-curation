import { Typography } from "@material-ui/core";
import { styled } from "@material-ui/core/styles";

interface PopoverTypographyProps {
  children: React.ReactNode;
}

const StyledTypography = styled(Typography)({
  padding: "4px 0 4px 0",
});

const PopoverTypography: React.FC<PopoverTypographyProps> = ({ children }) => (
  <StyledTypography variant="body2">{children}</StyledTypography>
);

export default PopoverTypography;
