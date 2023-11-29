import { Box, Divider, makeStyles, Paper } from "@material-ui/core";
import React from "react";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";

interface Props {
  leftColumn: React.ReactFragment;
  rightColumn: React.ReactFragment;
  leftColumnWidth: number | undefined;
}

const TabPaper: React.FC<Props> = ({
  leftColumn,
  rightColumn,
  leftColumnWidth,
}) => {
  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    pageContent: {
      display: "flex",
      backgroundColor: colorTheme["--light-gray"],
    },
    leftColumn: {
      height: "40%",
      minHeight: "85px",
      width: leftColumnWidth ? `${leftColumnWidth}%` : "50%",
    },
    leftPadder: {
      padding: "25px",
    },
    dividerContainer: {
      width: "2px",
      display: "flex",
      justifyContent: "center",
    },
    rightColumn: {
      width: leftColumnWidth ? `${100 - leftColumnWidth}%` : "50%",
    },
    rightPadder: { padding: "25px", height: "100%" },
  }));
  const classes = useStyles();
  return (
    <Paper className={classes.pageContent}>
      <Box className={classes.leftColumn}>
        <Box className={classes.leftPadder}>{leftColumn}</Box>
      </Box>
      <Box className={classes.dividerContainer}>
        <Divider orientation="vertical" />
      </Box>
      <Box className={classes.rightColumn}>
        <Box className={classes.rightPadder}>{rightColumn}</Box>
      </Box>
    </Paper>
  );
};

export default TabPaper;
