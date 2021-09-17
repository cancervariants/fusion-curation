import React, {useState} from 'react';
import NavTabs from '../NavTabs/NavTabs';
import { GeneContext } from '../../../global/contexts/GeneContext'
import { StructureContext } from '../../../global/contexts/StructureContext'
import '../../../global/styles/global.scss'
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../global/styles/theme';

import { useColorTheme } from '../../../global/contexts/Theme/ColorThemeContext';
import './App.scss';

function App() {

  const [genes, setGenes] = useState<unknown>([]);
  const [structure, setStructure] = useState<unknown>([]);

  const { colorTheme } = useColorTheme();

  
  return (
  
      <ThemeProvider theme={theme}>
        
        <GeneContext.Provider value={{genes, setGenes}}>
          <StructureContext.Provider value={{structure, setStructure}}>
            <div className="App" 
              style={{
               ...colorTheme
               } as React.CSSProperties}>
              <NavTabs />
            </div>
          </StructureContext.Provider>
          
        </GeneContext.Provider>    
        
      </ThemeProvider>
    

  );
}

export default App;
