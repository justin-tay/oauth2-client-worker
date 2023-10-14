import handleAuthorizationCode from './handleAuthorizationCode';
import { ProviderConfiguration } from './ProviderConfiguration';
import { ClientConfiguration } from './ClientConfiguration';
import { AuthConfiguration } from './AuthConfiguration';
import { AuthorizationContext } from './AuthorizationContext';
import { AuthorizationRequestContext } from './AuthorizationRequestContext';
import { AuthorizationRequest } from './AuthorizationRequest';
import fetchToken from './fetchToken';

jest.mock('./fetchToken');

const mockFetchToken = fetchToken as jest.Mock;

beforeEach(() => {
  mockFetchToken.mockClear();
});

const providerConfig: ProviderConfiguration = {
  issuer: 'http://keycloak',
  authorizationEndpoint: 'http://keycloak/authorization',
  tokenEndpoint: 'http://keycloak/token',
  pushedAuthorizationRequestEndpoint: 'http://keycloak/par',
};
const clientConfig: ClientConfiguration = {
  clientId: 'testclient',
  scopes: ['openid'],
  redirectUrl: 'http://localhost',
  providerRegistrationId: 'keycloak',
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

describe('handleAuthorizationCode', () => {
  it('should redirect even with no match', async () => {
    const authorizationRequests = new Map<
      string,
      AuthorizationRequestContext
    >();
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const url = new URL('http://localhost/?code=code&state=state');

    const response = await handleAuthorizationCode({
      authConfiguration,
      authorizationContexts,
      authorizationRequests,
      url,
    });
    expect(response.status).toBe(302);
    expect(mockFetchToken).toBeCalledTimes(0);
  });

  it('should redirect with match', async () => {
    const authorizationRequests = new Map<
      string,
      AuthorizationRequestContext
    >();
    const url = new URL('http://localhost/?code=code&state=state');
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const authorizationRequest: Partial<AuthorizationRequest> = {
      codeVerifier: 'codeVerifer',
      nonce: 'nonce',
      state: 'state',
    };
    const authorizationRequestContext: Partial<AuthorizationRequestContext> = {
      clientRegistrationId: 'account',
      authorizationRequest: authorizationRequest as AuthorizationRequest,
    };
    authorizationRequests.set(
      'state',
      authorizationRequestContext as AuthorizationRequestContext,
    );
    mockFetchToken.mockImplementation(() => Promise.resolve());
    const response = await handleAuthorizationCode({
      authConfiguration,
      authorizationContexts,
      authorizationRequests,
      url,
    });
    expect(response.status).toBe(302);

    expect(mockFetchToken).toBeCalledTimes(1);

    // Authorization request should be cleared
    expect(authorizationRequests.get('state')).toBeFalsy();
  });
});
