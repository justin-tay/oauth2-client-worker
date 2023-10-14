import { AuthConfiguration } from './AuthConfiguration';
import { AuthorizationContext } from './AuthorizationContext';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import { TokenResponse } from './TokenResponse';
import getEndSessionContext from './getEndSessionContext';

const providerConfig: ProviderConfiguration = {
  issuer: 'http://keycloak',
  authorizationEndpoint: 'http://keycloak/authorization',
  tokenEndpoint: 'http://keycloak/token',
  pushedAuthorizationRequestEndpoint: 'http://keycloak/par',
  endSessionEndpoint: 'http://keycloak/logout',
};
const clientConfig: ClientConfiguration = {
  clientId: 'testclient',
  scopes: ['openid'],
  redirectUrl: 'http://localhost',
  providerRegistrationId: 'keycloak',
  postLogoutRedirectUri: 'http://localhost/logged-out',
};

const authConfiguration: AuthConfiguration = {
  clientRegistry: {
    account: clientConfig,
  },
  providerRegistry: {
    keycloak: providerConfig,
  },
  resourceServers: [
    {
      path: /http:\/\/resourceserver\/resource\/.*/,
      clientRegistrationId: 'account',
    },
  ],
};

describe('getEndSessionUrl', () => {
  it('should set id token hint', async () => {
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const tokenResponse: Partial<TokenResponse> = {
      idToken: 'idToken',
    };
    const authorizationContext: Partial<AuthorizationContext> = {
      tokenResponse: tokenResponse as TokenResponse,
    };
    authorizationContexts.set(
      'account',
      authorizationContext as AuthorizationContext,
    );
    const result = getEndSessionContext(
      new URL(providerConfig.endSessionEndpoint!),
      authConfiguration,
      authorizationContexts,
    );
    expect(result?.url.searchParams.get('id_token_hint')).toBe('idToken');
  });

  it('should set post logout redirect uri', async () => {
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const tokenResponse: Partial<TokenResponse> = {
      idToken: 'idToken',
    };
    const authorizationContext: Partial<AuthorizationContext> = {
      tokenResponse: tokenResponse as TokenResponse,
    };
    authorizationContexts.set(
      'account',
      authorizationContext as AuthorizationContext,
    );
    const result = getEndSessionContext(
      new URL(providerConfig.endSessionEndpoint!),
      authConfiguration,
      authorizationContexts,
    );
    expect(result?.url.searchParams.get('post_logout_redirect_uri')).toBe(
      'http://localhost/logged-out',
    );
  });
});
