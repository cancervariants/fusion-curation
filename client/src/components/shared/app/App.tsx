import React, {useState, useEffect, useMemo} from 'react';
import NavTabs from '../NavTabs/NavTabs';
import { ResponsesContext } from '../../../contexts/ResponsesContext'
import { GeneContext } from '../../../contexts/GeneContext'
import '../../../global/styles/global.scss'

// export interface Responses {
//   'chimericTranscript' : string | undefined;
//   'nearRegulatory': string | undefined;
//   'rfPreserved': string | undefined;
//   'proteinCoding': string | undefined;
//   'causativeEventKnown': string | undefined;
//   'submitted': string | undefined;
// }

function App() {

  const [responses, setResponses] = useState<unknown>({});
  const [genes, setGenes] = useState<unknown>(['BCR', 'ABL1']);

  return (
    <div className="App">
      <GeneContext.Provider value={{genes, setGenes}}>
        <NavTabs />
      </GeneContext.Provider>    
    </div>
  );
}

export default App;
