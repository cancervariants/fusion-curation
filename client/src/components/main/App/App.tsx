import React, {useState, useEffect} from 'react';
import NavTabs from '../Nav/NavTabs';
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
        
        <SuggestionContext.Provider value={[suggestions, setSuggestions]}>
          <FusionContext.Provider value={{fusion, setFusion}}>
            <div className="App" 
              style={{
               ...colorTheme
               } as React.CSSProperties}>
              <h1 className="title">Fusion Curation</h1>
              <div className="main-component">
                <NavTabs />
              </div>
              
            </div>
          </FusionContext.Provider>
          
        </SuggestionContext.Provider>    
        
      </ThemeProvider>
    

  );
}

export default App;
