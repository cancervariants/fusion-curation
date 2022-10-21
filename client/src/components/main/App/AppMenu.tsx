import React from "react";
import "./App.scss";
import { Box, Typography, makeStyles, Link, Drawer } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  menuLink: {
    marginBottom: "15px",
    fontSize: "14px",
  },
  menuHeader: {
    marginTop: "30px",
    fontSize: "20px",
  },
}));

interface AppMenuProps {
  open?: boolean;
}

export default function AppMenu(props: AppMenuProps): React.ReactElement {
  const classes = useStyles();
  return (
    <Drawer
      variant="permanent"
      open={props.open}
      anchor="left"
      className="menu-drawer"
    >
      <Box ml="10px">
        <Link href="/" color="inherit">
          <h3>VICC Fusion Curation</h3>
        </Link>
        <Box className={`${classes.menuHeader} ${classes.menuLink}`}>
          <Typography color="inherit">
            <b>Tools</b>
          </Typography>
        </Box>
        <Box ml="10px">
          <Box className={classes.menuLink}>
            <Link href="/assayed-fusion" color="inherit">
              Assayed Fusion Tool
            </Link>
          </Box>
          <Box className={classes.menuLink}>
            <Link href="/categorical-fusion" color="inherit">
              Categorical Fusion Tool
            </Link>
          </Box>
          <Box className={classes.menuLink}>
            <Link href="/utilities" color="inherit">
              Utilities
            </Link>
          </Box>
        </Box>

        <Box className={`${classes.menuHeader} ${classes.menuLink}`}>
          <Typography color="inherit">
            <b>Resources</b>
          </Typography>
        </Box>
        <Box ml="10px">
          <Box className={classes.menuLink}>
            <Link
              href="https://fusions.cancervariants.org/en/latest/"
              target="_blank"
              color="inherit"
            >
              Fusions Home Page
            </Link>
          </Box>
          <Box className={classes.menuLink}>
            <Link
              href="https://github.com/cancervariants/fusion-curation"
              target="_blank"
              color="inherit"
            >
              Code Repository
            </Link>
          </Box>
          <Box className={classes.menuLink}>
            <Link
              href="https://cancervariants.org/"
              target="_blank"
              color="inherit"
            >
              VICC
            </Link>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
