import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker. On iOS this is what makes an installed PWA's
// localStorage persistent across launches (otherwise the saved passphrase is
// evicted between opens). Also ask the browser to keep storage persistent.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/sw.js`)
      .then(() => {
        if (navigator.storage && navigator.storage.persist) {
          navigator.storage.persist();
        }
      })
      .catch((err) => console.error('SW registration failed:', err));
  });
}

reportWebVitals();
