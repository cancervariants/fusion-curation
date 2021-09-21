import React, {useState} from 'react';
import NavTabs from '../NavTabs/NavTabs';
import { SuggestionContext } from '../../../global/contexts/SuggestionContext'
import { FusionContext } from '../../../global/contexts/FusionContext'
import '../../../global/styles/global.scss'
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../global/styles/theme';

import { useColorTheme } from '../../../global/contexts/Theme/ColorThemeContext';
import './App.scss';

function App() {

  const [suggestions, setSuggestions] = useState<unknown>([]);
  const [fusion, setFusion] = useState<unknown>([]);

  const { colorTheme } = useColorTheme();

  
  return (
  
      <ThemeProvider theme={theme}>
        
        <SuggestionContext.Provider value={{suggestions, setSuggestions}}>
          <FusionContext.Provider value={{fusion, setFusion}}>
            <div className="App" 
              style={{
               ...colorTheme
               } as React.CSSProperties}>
              <NavTabs />
            </div>
          </FusionContext.Provider>
          
        </SuggestionContext.Provider>    
        
      </ThemeProvider>
    

  );
}

export default App;
