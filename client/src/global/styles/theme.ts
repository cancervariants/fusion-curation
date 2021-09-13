
import React from 'react';
import {
  createTheme,
  makeStyles,
  createStyles,
  Theme as AugmentedTheme,
  ThemeProvider,
} from '@material-ui/core/styles';


declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    colors: {
      navbutton: string;
      enabledtabs: string;
      disabledtabs: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    colors?: {
      navbutton?: string;
      enabledtabs?: string;
      disabledtabs?: string;
    };
  }
}

// const useStyles = makeStyles((theme: AugmentedTheme) =>
//   createStyles({
//     root: {
//       color: theme.status.color,
//       '&$checked': {
//         color: theme.status.color,
//       },
//     },
//     checked: {},
//   }),
// );

const theme = createTheme({
  colors: {
    navbutton: '#0BD3D3',
    enabledtabs: '#FFFFFF',
    disabledtabs: '#F5F5FA',
  },
  
});

export default theme;