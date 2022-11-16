import { Box, Popover, makeStyles } from "@material-ui/core";
import React from "react";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";

interface HelpPopoverProps {
  children: React.ReactFragment;
}

export const HelpPopover: React.FC<HelpPopoverProps> = ({ children }) => {
  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    helpIcon: {
      verticalAlign: "sub",
      marginLeft: "3px",
    },
    popoverContainer: {
      backgroundColor: colorTheme["--primary"],
      color: colorTheme["--background"],
      padding: "5px",
      maxWidth: "300px",
    },
    popoverLink: {
      color: colorTheme["--background"],
      fontWeight: "bold",
      textDecoration: "underline",
    },
    popoverParagraph: {
      padding: "4px 0 4px 0",
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
        color="primary"
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
