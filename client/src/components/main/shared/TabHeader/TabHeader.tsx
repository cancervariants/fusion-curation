import { makeStyles, Box, Typography } from "@material-ui/core";
import React from "react";

interface Props {
  title: string;
  subHeader: React.ReactFragment;
}

const TabHeader: React.FC<Props> = ({ title, subHeader }) => {
  const useStyles = makeStyles(() => ({
    pageHeader: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100px",
      justifyContent: "space-around",
    },
  }));
  const classes = useStyles();

  return (
    <Box className={classes.pageHeader}>
      <Typography variant="h4">{title}</Typography>
      <Typography>{subHeader}</Typography>
    </Box>
  );
};

export default TabHeader;
