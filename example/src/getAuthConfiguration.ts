import {
  AuthConfiguration,
  ClientConfiguration,
  ClientRegistry,
  ProviderConfiguration,
  ProviderRegistry,
  ResourceServer,
} from 'oauth2-client-worker';

import configuration from './configuration';

const getAuthConfiguration = (): AuthConfiguration => {
  // The base url of Keycloak
  const { keycloakBaseUrl } = configuration;

  // The redirect url of the account client
  const { redirectUrl } = configuration;

  const providerConfig: ProviderConfiguration = {
    issuer: `${keycloakBaseUrl}/realms/master`,
    authorizationEndpoint: `${keycloakBaseUrl}/realms/master/protocol/openid-connect/auth`,
    tokenEndpoint: `${keycloakBaseUrl}/realms/master/protocol/openid-connect/token`,
    jwksUri: `${keycloakBaseUrl}/realms/master/protocol/openid-connect/certs`,
    endSessionEndpoint: `${keycloakBaseUrl}/realms/master/protocol/openid-connect/logout`,
    revocationEndpoint: `${keycloakBaseUrl}/realms/master/protocol/openid-connect/revoke`,
    // Public clients not supported - see https://github.com/keycloak/keycloak/issues/8939
    // pushedAuthorizationRequestEndpoint: `${keycloakBaseUrl}/realms/master/protocol/openid-connect/ext/par/request`,
  };

  const providerRegistry: ProviderRegistry = {
    keycloak: providerConfig,
  };

  const clientConfig: ClientConfiguration = {
    clientId: 'testclient',
    redirectUrl,
    scopes: ['openid'],
    providerRegistrationId: 'keycloak',
  };

  const clientRegistry: ClientRegistry = {
    account: clientConfig,
  };

  const path = new RegExp(`${keycloakBaseUrl}/admin/realms/master/.*`);

  const resourceServers: ResourceServer[] = [
    {
      path,
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
