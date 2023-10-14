import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import sendMessage from './sendMessage';

/*
 * Register interceptor for fetch to redirect to authorization endpoint.
 */
const { fetch: originalFetch } = window;
window.fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
) => {
  const response = await originalFetch(input, init);
  if (response.statusText === '401') {
    const location = response.headers.get('Location');
    if (location) {
      document.location.href = location;
    }
  }
  return response;
};

/**
 * Handles the service worker registration. If the page is hard-refresh
 * using CTRL+F5 there will be no service worker controlling the page and
 * a message should be send to the active service worker to control the page.
 *
 * @param registration the service worker registration
 */
const handleReady = async (registration: ServiceWorkerRegistration) => {
  if (registration) {
    // No service worker is controlling the page, for instance if there is a hard refresh
    if (!navigator.serviceWorker.controller && registration.active) {
      await sendMessage(registration.active, { type: 'CLAIM_CLIENTS' });
    }
    if (navigator.serviceWorker.controller) {
      // Render page
      ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
    }
  }
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(handleReady);
} else {
  console.error('Service workers are not supported.');
}
