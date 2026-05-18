import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import reportWebVitals from './reportWebVitals'; // Disabled
// import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // Disabled
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// reportWebVitals();
// serviceWorkerRegistration.unregister();
