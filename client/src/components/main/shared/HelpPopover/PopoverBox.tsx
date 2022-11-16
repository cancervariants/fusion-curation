import { Box } from "@material-ui/core";
import { styled } from "@material-ui/core/styles";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";

const PopoverBox = ({ children }) => {
  const { colorTheme } = useColorTheme();

  const StyledBox = styled(Box)({
    backgroundColor: colorTheme["--primary"],
    color: colorTheme["--background"],
    padding: "10px",
    maxWidth: "300px",
  });

  return <StyledBox>{children}</StyledBox>;
};

export default PopoverBox;
