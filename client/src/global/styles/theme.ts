import { createTheme } from "@material-ui/core/styles";

import { COLORTHEMES } from "../contexts/Theme/Theme.model";

declare module "@material-ui/core/styles/createTheme" {
  interface Theme {
    colors: {
      navbutton: string;
      enabledtabs: string;
      disabledtabs: string;
      viccBlue: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    colors?: {
      navbutton?: string;
      enabledtabs?: string;
      disabledtabs?: string;
      viccBlue?: string;
    };
    marginOffsets?: {
      appContent?: number;
      structureBlocks?: number;
    };
  }
}

const theme = createTheme({
  colors: {
    navbutton: "#0BD3D3",
    enabledtabs: "#FFFFFF",
    disabledtabs: "#F5F5FA",
  },
  palette: {
    primary: {
      main: COLORTHEMES.light["--primary"],
      contrastText: COLORTHEMES.light["--white"],
    },
    secondary: {
      main: COLORTHEMES.light["--secondary"],
      contrastText: COLORTHEMES.light["--white"],
    }
  },
});

export const MARGIN_OFFSETS = {
  appContent: 175,
  structureBlocks: 450,
};

export default theme;
