import refreshToken from './refreshToken';
import { ProviderConfiguration } from './ProviderConfiguration';
import { ClientConfiguration } from './ClientConfiguration';
import { AuthorizationContext } from './AuthorizationContext';
import { RefreshTokenRequest } from './RefreshTokenRequest';
import verifyTokenResponse from './verifyTokenResponse';
import { Mock } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('./verifyTokenResponse');
const mockVerifyTokenResponse = verifyTokenResponse as Mock<
  typeof verifyTokenResponse
>;

beforeEach(() => {
  mockFetch.mockClear();
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

describe('refreshToken', () => {
  it('should refresh if valid', async () => {
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const authorizationContext: Partial<AuthorizationContext> = {
      tokenResponse: {
        accessToken: 'accessToken',
        tokenType: 'bearer',
      },
    };
    authorizationContexts.set(
      'account',
      authorizationContext as AuthorizationContext,
    );
    const fetchResponse: Partial<Response> = {
      ok: true,
      statusText: '200',
      json: () => Promise.resolve({ access_token: 'newAccessToken' }),
    };
    mockFetch.mockImplementation(() => Promise.resolve(fetchResponse));
    mockVerifyTokenResponse.mockImplementation(() => Promise.resolve(true)); // valid
    const request: Partial<RefreshTokenRequest> = {
      refreshToken: 'refreshToken',
    };

    const result = await refreshToken({
      request: request as RefreshTokenRequest,
      clientRegistrationId: 'account',
      authorizationContexts,
      clientConfig,
      providerConfig,
    });
    expect(result?.tokenResponse.accessToken).toBe('newAccessToken');
  });

  it('should not refresh if not valid', async () => {
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const authorizationContext: Partial<AuthorizationContext> = {
      tokenResponse: {
        accessToken: 'accessToken',
        tokenType: 'bearer',
      },
    };
    authorizationContexts.set(
      'account',
      authorizationContext as AuthorizationContext,
    );
    const fetchResponse: Partial<Response> = {
      ok: true,
      statusText: '200',
      json: () => Promise.resolve({ access_token: 'newAccessToken' }),
    };
    mockFetch.mockImplementation(() => Promise.resolve(fetchResponse));
    mockVerifyTokenResponse.mockImplementation(() => Promise.resolve(false)); // not valid
    const request: Partial<RefreshTokenRequest> = {
      refreshToken: 'refreshToken',
    };

    const result = await refreshToken({
      request: request as RefreshTokenRequest,
      clientRegistrationId: 'account',
      authorizationContexts,
      clientConfig,
      providerConfig,
    });
    expect(result).toBeFalsy();
  });

  it('should clear access token if response not ok', async () => {
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const authorizationContext: Partial<AuthorizationContext> = {
      tokenResponse: {
        accessToken: 'accessToken',
        tokenType: 'bearer',
      },
    };
    authorizationContexts.set(
      'account',
      authorizationContext as AuthorizationContext,
    );
    const fetchResponse: Partial<Response> = {
      ok: false,
      statusText: '400',
      json: () => Promise.resolve({ error: 'invalid_grant' }),
    };
    mockFetch.mockImplementation(() => Promise.resolve(fetchResponse));
    mockVerifyTokenResponse.mockImplementation(() => Promise.resolve(true)); // valid
    const request: Partial<RefreshTokenRequest> = {
      refreshToken: 'refreshToken',
    };

    const result = await refreshToken({
      request: request as RefreshTokenRequest,
      clientRegistrationId: 'account',
      authorizationContexts,
      clientConfig,
      providerConfig,
    });
    expect(result?.tokenResponse.accessToken).toBe('');
  });
});
