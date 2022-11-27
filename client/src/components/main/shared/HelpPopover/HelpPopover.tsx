import { Box, Popover, makeStyles } from "@material-ui/core";
import React from "react";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";

interface HelpPopoverProps {
  children: React.ReactFragment;
  iconStyle?: object;
  backgroundStyle?: object;
  linkStyle?: object;
}

export const HelpPopover: React.FC<HelpPopoverProps> = ({
  children,
  iconStyle,
  backgroundStyle,
  linkStyle,
}) => {
  const { colorTheme } = useColorTheme();

  const useStyles = makeStyles(() => ({
    helpIcon: {
      verticalAlign: "sub",
      marginLeft: "3px",
      color: colorTheme["--primary"],
      ...iconStyle,
    },
    popoverContainer: {
      backgroundColor: colorTheme["--primary"],
      color: colorTheme["--background"],
      padding: "7px",
      maxWidth: "300px",
      ...backgroundStyle,
      "& p:not(:last-child)": {
        paddingBottom: "4px",
      },
      "& p": {
        fontSize: "0.875rem",
        lineHeight: "1.43",
        "& a": {
          color: colorTheme["--background"],
          fontWeight: "bold",
          textDecoration: "underline",
        },
      },
    },
  }));
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  return (
    <>
      <HelpOutlineIcon
        className={classes.helpIcon}
        onClick={handleClick}
        fontSize="small"
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
      >
        <Box className={classes.popoverContainer}>{children}</Box>
      </Popover>
    </>
  );
};
