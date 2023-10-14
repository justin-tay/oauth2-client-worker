import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import {
  AuthorizeEvent,
  EndSessionEvent,
  fetchListener,
} from 'oauth2-client-worker';
import getAuthConfiguration from './getAuthConfiguration';

declare let self: ServiceWorkerGlobalScope;

let user: any;

const decodeBase64Url = (base64Url: string) => {
  return atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'));
};

const decodeIdTokenPayload = (idToken?: string) => {
  if (idToken) {
    const payload = idToken.split('.')[1];
    if (payload) {
      return JSON.parse(decodeBase64Url(payload));
    }
  }
  return null;
};

const installListener = (_event: ExtendableEvent) => {
  console.log('Installing');
  self.skipWaiting();
};

const activateListener = (event: ExtendableEvent) => {
  console.log('Activating');
  const claim = self
    .skipWaiting()
    .then(() => self.clients.claim())
    .then(() => self.clients.matchAll())
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'READY' });
      });
    })
    .catch(console.error);
  event.waitUntil(claim);
};

const messageListener = (event: ExtendableMessageEvent) => {
  switch (event.data?.type) {
    case 'CLAIM_CLIENTS':
      console.log('Claiming clients');
      self.clients.claim().then(() => {
        event.ports[0].postMessage({ type: 'READY' });
      });
      break;
    case 'USER':
      event.ports[0].postMessage({ type: 'USER', idToken: user });
      break;
  }
};

const authorizeCallback = (event: AuthorizeEvent) => {
  user = decodeIdTokenPayload(event.idToken);
  self.clients
    .matchAll()
    .then((clients) =>
      clients.forEach((client) =>
        client.postMessage({ type: 'AUTHORIZE', idToken: user }),
      ),
    );
};

const endSessionCallback = (event: EndSessionEvent) => {
  const idToken = decodeIdTokenPayload(event.idToken);
  self.clients
    .matchAll()
    .then((clients) =>
      clients.forEach((client) =>
        client.postMessage({ type: 'END_SESSION', idToken }),
      ),
    );
};

self.addEventListener('install', installListener);
self.addEventListener('activate', activateListener);
self.addEventListener(
  'fetch',
  fetchListener(getAuthConfiguration(), {
    authorizeCallback,
    endSessionCallback,
  }),
);
self.addEventListener('message', messageListener);

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();
