import React, {useState, useEffect, useMemo} from 'react';
import NavTabs from './components/NavTabs';
import { ResponsesContext } from './contexts/ResponsesContext';

// export interface Responses {
//   'chimericTranscript' : string | undefined;
//   'nearRegulatory': string | undefined;
//   'rfPreserved': string | undefined;
//   'proteinCoding': string | undefined;
//   'causativeEventKnown': string | undefined;
//   'submitted': string | undefined;
// }

function App() {

  const [responses, setResponses] = useState<any>({});

  return (
    <div className="App">
      <ResponsesContext.Provider value={{responses, setResponses}}>
        <NavTabs />
      </ResponsesContext.Provider>    
    </div>
  );
}

export default App;
