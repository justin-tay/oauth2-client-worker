import { AuthConfiguration } from './AuthConfiguration';
import { AuthorizationContext } from './AuthorizationContext';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import fetchListener from './fetchListener';

const mockFetch = vi.fn();

global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

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

describe('fetchListener', () => {
  it('should block authorization endpoint', async () => {
    const request = new Request(providerConfig.authorizationEndpoint);
    const respondWith = vi.fn();
    const event: Partial<FetchEvent> = { request, respondWith };
    fetchListener(authConfiguration)(event as FetchEvent);
    const response = await respondWith.mock.calls[0][0];
    expect(response?.statusText).toBe('403');
  });

  it('should block token endpoint', async () => {
    const request = new Request(providerConfig.tokenEndpoint);
    const respondWith = vi.fn();
    const event: Partial<FetchEvent> = { request, respondWith };
    fetchListener(authConfiguration)(event as FetchEvent);
    const response = await respondWith.mock.calls[0][0];
    expect(response?.statusText).toBe('403');
  });

  it('should end session', async () => {
    const request = new Request(providerConfig.endSessionEndpoint!);
    const respondWith = vi.fn();
    const event: Partial<FetchEvent> = { request, respondWith };
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const authorizationContext: Partial<AuthorizationContext> = {
      tokenResponse: {
        accessToken: 'accessToken',
        tokenType: 'bearer',
        idToken: 'idToken',
      },
    };
    authorizationContexts.set(
      'account',
      authorizationContext as AuthorizationContext,
    );
    const response = Promise.resolve();
    mockFetch.mockImplementation(() => response);
    fetchListener(authConfiguration, { authorizationContexts })(
      event as FetchEvent,
    );
    expect(respondWith).toBeCalledTimes(1);
    expect(respondWith).toBeCalledWith(response);
    const url: URL = mockFetch.mock.calls[0][0];
    expect(url.searchParams.get('id_token_hint')).toBe('idToken');
  });
});
