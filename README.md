# OAuth2 Client Worker

## Background

This provides an implementation of an OAuth2 client in the [Service Worker](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#name-acquiring-tokens-from-a-ser) model as described in [OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps).

Applications should prefer the use of the [Backend For Frontend (BFF) Proxy](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#name-backend-for-frontend-bff-pr) model where a backend component acts as a confidential OAuth2 client to acquire and inject tokens for requests going to Resource Servers. The backend maintains a session with the frontend via the use of a HTTP-only cookie. XSS would not be able to read a HTTP-only cookie. As cookies will be automatically sent on requests, the application requires CSRF protection. CSRF protection is typically implemented using the [Cookie to header token](https://en.wikipedia.org/wiki/Cross-site_request_forgery#Cookie-to-header_token) mechanism.

The use of the Backend For Frontend Proxy is preferred as it is resistent to XSS stealing the session credential stored in a HTTP-only cookie.

The use of a Service Worker requires that the user has installed a [compatible browser](https://caniuse.com/serviceworkers), and the possibility of subtle implementation differences between different browsers means the Service Worker implementation would need to be tested against all supported browsers. For instance, Service Workers works in Chrome in Incognito mode but [Service Workers do not work in Firefox when in Private Browsing mode](https://bugzilla.mozilla.org/show_bug.cgi?id=1320796).

It is also possible for XSS to target the Service Worker context. For instance if the Service Worker uses the [importScripts](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts) function with a parameter that an attacker can modify, such as an unvalidated search parameter as part of the `scriptURL` to the [serviceWorker.register](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register) method, the attacker can load a script from a domain the attacker controls and get XSS in the Service Worker context.

In cases where the Service Worker is not controlling the page and intercepting `fetch` requests, it is possible for XSS to initiate the Authorization Request and process the Authorization Response and acquire tokens from the Authorization Server. For instance, by default, after a hard refresh [the Service Worker will not be controlling the page](https://w3c.github.io/ServiceWorker/#navigator-service-worker-controller).

## Features

- Only Public Clients are supported
- Only [Authorization Code](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1) flow is supported
- [Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636) using `S256` is mandatory
- [Pushed Authorization Requests](https://datatracker.ietf.org/doc/html/rfc9126/) is supported

## Implementation

- The Service Worker initiates the Authorization Code grant itself by responding to the main application with `401` and the `Location` with the Authorization Request details to be sent
- The Service Worker intercepts the Authorization Code when the Authorization Server redirects to the application and redirects the main application with a response that does not include the query parameters
- The Service Worker initiates the Token Request itself
- Tokens, authorization codes and the PKCE code verifier are only stored in memory in the Service Worker context
- The Service Worker does not transmit the tokens, authorization codes or PKCE code verifier to the main application
- The Service Worker blocks authorization requests and token requests from the main application and will respond to the main application with `403`

## Usage

The `fetchListener` function is used to create a listener for responding to `fetch` events in a Service Worker which should be implemented in the application.

The library itself does not expose a function to create a Service Worker as an application can only have one Service Worker per scope.

See the included `example` application for a working example.

### Configuration

The `fetchListener` function accepts a `AuthConfiguration` for configuring the following

- The Resource Servers that require authorization and their paths
- The Clients that can be used to access the Resource Servers
- The Providers that the Clients use to acquire tokens

The Clients and Providers are identified using a Client Registration ID and Provider Registration ID.

```typescript
import {
  AuthConfiguration,
  ClientConfiguration,
  ClientRegistry,
  ProviderConfiguration,
  ProviderRegistry,
  ResourceServer,
} from 'oauth2-client-worker';

const getAuthConfiguration = (): AuthConfiguration => {
  const providerConfig: ProviderConfiguration = {
    issuer: 'http://localhost:8080/auth/realms/master',
    authorizationEndpoint:
      'http://localhost:8080/auth/realms/master/protocol/openid-connect/auth',
    tokenEndpoint:
      'http://localhost:8080/auth/realms/master/protocol/openid-connect/token',
    jwksUri:
      'http://localhost:8080/auth/realms/master/protocol/openid-connect/certs',
    endSessionEndpoint:
      'http://localhost:8080/auth/realms/master/protocol/openid-connect/logout',
    revocationEndpoint:
      'http://localhost:8080/auth/realms/master/protocol/openid-connect/revoke',
  };

  const providerRegistry: ProviderRegistry = {
    keycloak: providerConfig,
  };

  const clientConfig: ClientConfiguration = {
    clientId: 'testclient',
    redirectUrl: 'http://localhost:5173',
    scopes: ['openid'],
    providerRegistrationId: 'keycloak',
  };

  const clientRegistry: ClientRegistry = {
    account: clientConfig,
  };

  const resourceServers: ResourceServer[] = [
    {
      path: /http:\/\/localhost:8080\/auth\/admin\/realms\/master\/.*/,
      clientRegistrationId: 'account',
    },
  ];

  return {
    clientRegistry,
    providerRegistry,
    resourceServers,
  };
};

export default getAuthConfiguration;
```

### Service Worker

The Service Worker will need to use the `fetchListener`.

```typescript
import { fetchListener } from 'oauth2-client-worker';
import getAuthConfiguration from './getAuthConfiguration';

self.addEventListener('fetch', fetchListener(getAuthConfiguration()));
```

Where there are multiple `EventListener` implementations listening to the `fetch` event, they will be tried in the sequence they are registered and the first one that calls [event.respondWith](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/respondWith) will be processed and the rest will not be called.

### Fetch Interceptor

The main thread's `fetch` needs to process and perform top-level navigation when there is `401` with the `Location` header.

```typescript
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
```

### Ensure Service Worker Controlling Page

The security of this model depends on the Service Worker controlling the page and intercepting `fetch` requests.

If a hard refresh using `CTRL+F5` is used the Service Worker will not be controlling the page. Meaning `navigator.serviceWorker.controller` returns `null`.

The application should ensure that the Service Worker is controlling the page by getting the Service Worker to claim the client.

**Application**

```typescript
/**
 * Send message to service worker and get response.
 *
 * @param serviceWorker the service worker to send the message
 * @param message the message
 * @returns the response
 */
const sendMessage = (serviceWorker: ServiceWorker, message: any) => {
  return new Promise<any>((resolve) => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };
    serviceWorker.postMessage(message, [messageChannel.port2]);
  });
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
```

**Service Worker**

```typescript
const messageListener = async (event: ExtendableMessageEvent) => {
  switch (event.data?.type) {
    case 'CLAIM_CLIENTS': {
      console.log('Claiming clients');
      await self.clients.claim();
      event.ports[0].postMessage({ type: 'READY' });
    }
  }
};

self.addEventListener('message', messageListener);
```

## Design

### Initiating the Authorization Request

The authorization request is initiated in the Service Worker if the Application's request is for a Resource Server and there is no valid access token. The Service Worker will respond to this request with a `401` status code with a `Location` header that indicates the authorization request.

If a [Pushed Authorization Request Endpoint](https://datatracker.ietf.org/doc/html/rfc9126) is configured, the Service Worker will first send the the authorization request parameters to the pushed authorization request endpoint and the `Location` header for the authorization endpoint will only indicate the `request_uri`.

A `302` status code is not used as such requests will automatically be followed by the browser even for javascript-initiated requests using `fetch`, and the calling code will not be able to process the `Location` header. The Application's calling code will need to process `401` responses with the `Location` header and perform a top-level navigation using `document.location.href`.

Applications should always send authorization requests to the Authorization Server using a top-level navigation as other mechanisms, like using an Inline Frame, may encounter issues, for example with browsers blocking third-party cookies. Applications that wish to maintain state before the top-level navigation to the Authorization Server should use `sessionStorage` to store such state. Note that storing such state in `sessionStorage` may fail when using private browsing modes. This is needed in any case to support use cases like the user refreshing the page using F5.

### The `state` parameter

The `state` parameter is used to detect malicious code making CSRF authorization requests to the authorization endpoint or by forging authorization responses to the application's `redirect_uri`. The Service Worker will check when processing the authorization response, before making the token request, that the authorization request was sent by itself by checking that the `state` parameter. The Service Worker actually stores all authorization requests made by it in a map with the `state` parameter as a key in order to fetch data linked to the original authorization request, for instance to obtain the `code_verifier` value to send to the token endpoint.

### The `code_challenge` parameter

The `code_challenge` parameter is part of the [Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636) and is used to detect when malicious code intercepts the authorization response and is attempting to make a token request by using the `code` from the authorization response. The malicious code will be unable to determine the correct `code_verifier` parameter to send to the token endpoint to obtain the tokens.

Note that this does not prevent malicious code from attempting to make the authorization request itself as it can then generate the `code_verifier` and `code_challenge` itself when making such a request.

The Service Worker first generates a random `code_verifier` value. It then uses `S256` to hash this value as the `code_challenge`. The `code_challenge` is sent as part of the authorization request. The `code_verifier` is stored as part of the data linked to the original authorization request and will be sent by the Service Worker to the token endpoint after processing the authorization response from the Authorization Server.

### The `nonce` parameter

The `nonce` parameter is part of the [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) specification and is used by the Service Worker to detect replay attacks when retrieving the tokens from the token endpoint. The malicious code here is in a position to intercept requests from the Service Worker to the token endpoint of the Authorization Server and can capture ID tokens sent by the Authorization Server to the Service Worker and selectively replay such responses to the Service Worker. The Service Worker checks this by verifying that the `nonce` claim on the ID Token received from the token endpoint contains the initial `nonce` parameter sent with the authorization request.

### Processing the Authorization Response

The Service Worker will intercept all requests with a `code` and `state` query parameter and will respond with a redirect without query parameters, effectively removing them from the calling application. The Service Worker must find a matching Authorization Request that was previously sent with that `state` parameter before proceeding to initiate the Token Request.

### Initiating the Token Request

The Service Worker will initiate the Token Request itself based on the `code` and `state` query parameters received from the redirect from the Authorization Server. The Service Worker will find the previously sent Authorization Request and associated data with the `state` parameter.

The Service Worker will send the `code` and `code_verifier` to the Token Endpoint to retrieve the tokens.

### Processing the Token Response

The Service Worker will verify the `id_token` and optionally the `access_token` in the response.

The following will be verified from the `id_token`

- The JWS Signature
- The `issuer` claim
- The `aud` claim
- The `iat` claim
- The `nbf` claim
- The `exp` claim
- The `nonce` claim is from the previously sent Authorization Request

The following will be verified from the `access_token` if configured to do so as the token can be an opaque token and not a JWT token

- The JWS Signature
- The `issuer` claim
- The `aud` claim
- The `iat` claim
- The `nbf` claim
- The `exp` claim
