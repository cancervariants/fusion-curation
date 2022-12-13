import React, { useEffect, useState } from "react";
import "./App.scss";
import { Box, Typography, makeStyles, Link, Drawer } from "@material-ui/core";
import { ServiceInfoResponse } from "../../../services/ResponseModels";
import { getInfo } from "../../../services/main";

const useStyles = makeStyles(() => ({
  menuLink: {
    marginBottom: "15px",
    fontSize: "14px",
  },
  menuHeader: {
    marginTop: "30px",
    fontSize: "20px",
  },
  upperSection: {
    marginLeft: "10px",
  },
  lowerSection: {
    marginBottom: "10px",
    display: "flex",
    justifyContent: "center",
  },
  drawerContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  versionText: {
    fontSize: "0.7rem",
  },
}));

interface AppMenuProps {
  open?: boolean;
}

export default function AppMenu(props: AppMenuProps): React.ReactElement {
  const [serviceInfo, setServiceInfo] = useState({} as ServiceInfoResponse);

  useEffect(() => {
    getInfo().then((infoResponse) => {
      setServiceInfo(infoResponse);
    });
  });

  const classes = useStyles();
  return (
    <Drawer
      variant="permanent"
      open={props.open}
      anchor="left"
      className="menu-drawer"
    >
      <Box className={classes.drawerContainer}>
        <Box className={classes.upperSection}>
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
                Gene Fusion Specification
              </Link>
            </Box>
            <Box className={classes.menuLink}>
              <Link
                href={`${process.env.REACT_APP_DEV_PROXY}/docs`}
                target="_blank"
                color="inherit"
              >
                API
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
                VICC Home Page
              </Link>
            </Box>
          </Box>
        </Box>

        <Box className={classes.lowerSection}>
          <Typography className={classes.versionText}>
            v{serviceInfo.curfu_version}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
