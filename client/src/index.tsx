import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ResponseContext, responses } from './contexts/ResponseContext';

ReactDOM.render(
  <React.StrictMode>
    <ResponseContext.Provider value={responses}>
      <App />
    </ResponseContext.Provider>
    
  </React.StrictMode>,
  document.getElementById('root')
);

