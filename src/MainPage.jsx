import { React } from 'react';
import {
  Box, Container, AppBar, Typography, Toolbar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FormParent from './FormParent';

const MainPage = () => {
  const useStyles = makeStyles(() => ({
    root: {
      flexGrow: 1,
    },
    title: {
      flexGrow: 1,
    },
  }));

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Container maxWidth="md">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Gene Fusion Curation
            </Typography>
          </Toolbar>
        </AppBar>
        <Box boxShadow={1}>
          <FormParent />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        </Box>
      </Container>
    </div>
  );
};

export default MainPage;
