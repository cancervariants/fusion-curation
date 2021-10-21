import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/main/App/App';
import { ColorThemeProvider } from './global/contexts/Theme/ColorThemeContext';

ReactDOM.render(
  <React.StrictMode>
    <ColorThemeProvider>
      <App />
    </ColorThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
