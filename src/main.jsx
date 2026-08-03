import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { APP_VERSION, syncAppVersion } from './services/pwaService.js'

(async () => {
  await syncAppVersion();

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
})();

// Registra Service Worker para PWA Offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        console.log('Lipp Board PWA Service Worker registrado com sucesso:', reg.scope);
      })
      .catch((err) => {
        console.warn('Falha ao registrar Service Worker:', err);
      });
  });
}
