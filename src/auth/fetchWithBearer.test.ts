import crypto from 'crypto';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import { AuthorizationContext } from './AuthorizationContext';
import fetchWithBearer from './fetchWithBearer';
import refreshToken from './refreshToken';
import { TokenResponse } from './TokenResponse';

global.crypto = crypto as any;

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

jest.mock('./refreshToken');

const mockRefreshToken = refreshToken as jest.Mock;

beforeEach(() => {
  mockRefreshToken.mockClear();
  mockFetch.mockClear();
});

describe('fetchWithBearer', () => {
  it('should not refresh if no refresh token', async () => {
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
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const request = new Request('http://resourceserver/resource');
    const fetchResponse: Partial<Response> = {
      statusText: '401',
    };
    mockFetch.mockImplementationOnce(() => Promise.resolve(fetchResponse));
    const response = await fetchWithBearer({
      request,
      clientRegistrationId: 'account',
      authorizationContext: authorizationContexts.get(
        'account',
      ) as AuthorizationContext,
      authorizationContexts,
      clientConfig,
      providerConfig,
    });
    expect(response?.statusText).toBe('401');
    expect(mockRefreshToken).toBeCalledTimes(0);
  });

  it('should refresh if refresh token present and 401', async () => {
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
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const authorizationContext: Partial<AuthorizationContext> = {
      tokenResponse: { refreshToken: 'refreshToken' } as TokenResponse,
    };
    authorizationContexts.set(
      'account',
      authorizationContext as AuthorizationContext,
    );
    const request = new Request('http://resourceserver/resource');
    const fetchResponse: Partial<Response> = {
      statusText: '401',
    };
    mockFetch.mockImplementationOnce(() => Promise.resolve(fetchResponse));
    mockRefreshToken.mockImplementationOnce(() => {
      authorizationContext.tokenResponse = {
        accessToken: 'accessToken',
      } as TokenResponse;
      return Promise.resolve(authorizationContext);
    });
    const response = await fetchWithBearer({
      request,
      clientRegistrationId: 'account',
      authorizationContext: authorizationContexts.get(
        'account',
      ) as AuthorizationContext,
      authorizationContexts,
      clientConfig,
      providerConfig,
    });
    expect(response).toBeFalsy();
    expect(mockRefreshToken).toBeCalledTimes(1);
    expect(mockFetch).toBeCalledTimes(2);
  });

  it('should refresh if refresh token present and error', async () => {
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
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const authorizationContext: Partial<AuthorizationContext> = {
      tokenResponse: { refreshToken: 'refreshToken' } as TokenResponse,
    };
    authorizationContexts.set(
      'account',
      authorizationContext as AuthorizationContext,
    );
    const request = new Request('http://resourceserver/resource');
    mockFetch.mockImplementationOnce(() => Promise.reject(new Error('error')));
    mockRefreshToken.mockImplementationOnce(() => {
      authorizationContext.tokenResponse = {
        accessToken: 'accessToken',
      } as TokenResponse;
      return Promise.resolve(authorizationContext);
    });
    const response = await fetchWithBearer({
      request,
      clientRegistrationId: 'account',
      authorizationContext: authorizationContexts.get(
        'account',
      ) as AuthorizationContext,
      authorizationContexts,
      clientConfig,
      providerConfig,
    });
    expect(response).toBeFalsy();
    expect(mockRefreshToken).toBeCalledTimes(1);
    expect(mockFetch).toBeCalledTimes(2);
  });
});
