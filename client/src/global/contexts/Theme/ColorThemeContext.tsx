import React, { Dispatch, SetStateAction } from 'react';
import {ColorThemeType, ColorTheme, COLORTHEMES} from './Theme.model';

interface ColorThemeContextProps {
  colorThemeType: ColorThemeType;
  colorTheme: ColorTheme,
  setCurrentColorTheme: Dispatch<SetStateAction<ColorThemeType>>
}

export const ColorThemeContext = React.createContext<ColorThemeContextProps>({
  colorThemeType: 'light',
  colorTheme: COLORTHEMES['light'],
} as ColorThemeContextProps);

export const ColorThemeProvider: React.FC = ({ children }) => {
  const [currentColorTheme, setCurrentColorTheme] = React.useState<ColorThemeType>('light');

  return (
    <ColorThemeContext.Provider value={{
      colorThemeType: currentColorTheme,
      colorTheme: COLORTHEMES[currentColorTheme],
      setCurrentColorTheme,
    }}>
      {children}
    </ColorThemeContext.Provider>
  );
};

export const useColorTheme = (): ColorThemeContextProps => React.useContext(ColorThemeContext);