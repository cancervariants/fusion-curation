import { Link } from "@material-ui/core";
import { styled } from "@material-ui/core/styles";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";

interface PopoverLinkProps {
  children: React.ReactNode;
  href: string;
}

const PopoverLink: React.FC<PopoverLinkProps> = (props) => {
  const { colorTheme } = useColorTheme();

  const StyledLink = styled(Link)({
    color: colorTheme["--background"],
    fontWeight: "bold",
    textDecoration: "underline",
  });
  return <StyledLink {...props}>{props.children}</StyledLink>;
};

export default PopoverLink;
