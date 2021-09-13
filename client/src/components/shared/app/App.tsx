import React, {useState} from 'react';
import NavTabs from '../NavTabs/NavTabs';
import { GeneContext } from '../../../contexts/GeneContext'
import { StructureContext } from '../../../contexts/StructureContext'
import '../../../global/styles/global.scss'
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../global/styles/theme';

import './App.scss';


function App() {

  const [genes, setGenes] = useState<unknown>(['BCR', 'ABL1']);
  const [structure, setStructure] = useState<unknown>([]);

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <GeneContext.Provider value={{genes, setGenes}}>
          <StructureContext.Provider value={{structure, setStructure}}>
            <NavTabs />
          </StructureContext.Provider>
          
        </GeneContext.Provider>    
      </div>
    </ThemeProvider>

  );
}

export default App;
