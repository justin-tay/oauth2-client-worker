# OAuth2 Client Worker Example

An example React Single Page Application that uses the Service Worker model to acquire OAuth2 tokens.

This example

- Uses Keycloak as the Authorization Server and Resource Server for testing.
- Uses `vite-plugin-pwa` that uses `workbox` to register the Service Worker.

## Background

```mermaid
sequenceDiagram
    autonumber

    participant User
    participant Application
    participant Service Worker
    participant Authorization Server
    participant Resource Server

    User->>Application: Click button to trigger request to Resource Server

    Application->>Application: Store request for Resource Server in Session Storage

    Application->>+Service Worker: Send request to Resource Server intercepted by Service Worker

    Service Worker->>Service Worker: Generate state, nonce, PKCE code verifier and code challenge for Authorization Request.

    opt Pushed Authorization Request
    Service Worker->>Service Worker: Generate Pushed Authorization Request for Authorization Server.
    Service Worker->>+Authorization Server: Send Pushed Authorization Request to Authorization Server.
    Authorization Server-->>-Service Worker: Return Redirect URI for Authorization Request
    end

    Service Worker->>Service Worker: Generate and store Authorization Request for Authorization Server.

    Service Worker-->>-Application: Return Authorization Request as 401 Unauthorized status with Location header

    Application->>+Authorization Server: Top-level navigation with Authorization Request

    Authorization Server->>Authorization Server: Create Login Page

    Authorization Server-->>-Application: Return Login Page

    User->>Application: Enter Login Credentials

    Application->>+Authorization Server: Submit Login Credentials

    Authorization Server->>Authorization Server: Authenticate Login Credentials

    Authorization Server-->>-Application: Return Authorization Response as redirect to Registered Callback with Authorization Code and state

    Application->>+Service Worker: Intercept Callback with Authorization Code and state

    Service Worker->>Service Worker: Verify state in Authorization Response from previous Authorization Request

    Service Worker->>+Authorization Server: Send Token Request with Authorization Code and PKCE code verifier to Authorization Server

    Authorization Server->>Authorization Server: Verify Authorization Code and PKCE code verifier

    Authorization Server-->>-Service Worker: Return Token Response with Access Token, Refresh Token and ID Token

    Service Worker->>Service Worker: Verify signature and nonce in ID Token and store tokens

    Service Worker-->>-Application: Redirect to Application without Authorization Code and State

    Application->>Application: Load request for Resource Server from Session Storage

    Application->>+Service Worker: Send request to Resource Server intercepted by Service Worker

    Service Worker->>+Resource Server: Send request to Resource Server with Access Token

    Resource Server->>Resource Server: Verify Access Token and generate response

    Resource Server-->>-Service Worker: Return Resource Server response

    Service Worker-->>-Application: Return Resource Server response

    Application->>Application: Render response

```

## Quick Start

### Install

The `oauth2-client-worker` library needs to be built in `dist` first

```shell
cd..
npm run build
```

The packages for the example then need to be installed

```shell
npm install
```

### Development Server

The development server can be run using

```shell
npm run dev
```

The development server will be running on http://localhost:5173/.

### Preview Server (Optional)

The preview server uses the production build to run and best reflects how the Application will run in production

The preview server needs the example to be built first

```shell
npm run build
```

The preview server can be run using

```shell
npm run preview
```

The preview server will be running on http://localhost:5173/.

## Keycloak Server

Keycloak can be downloaded from https://www.keycloak.org/downloads.

```shell
kc start-dev
```

Keycloak will be running at http://localhost:8080

The admin user should be created with `admin` user and `admin` as password

The Public Client `testclient` can be setup using the following script which will set the Web Origins for Cross-Origin Resource Sharing and Registered Redirect URIs for the Application.

```shell
node scripts/keycloak-setup.js
```

## Template

The following are the initial commands for creating the example.

```shell
npm create vite@latest oauth2-client-worker-example -- --template react-ts
```

```shell
npm install -D vite-plugin-pwa
```
