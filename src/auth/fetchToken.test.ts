import crypto from 'crypto';
import { AuthorizationRequest } from './AuthorizationRequest';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import fetchToken from './fetchToken';
import { AuthorizationCodeAccessTokenRequest } from './AuthorizationCodeAccessTokenRequest';
import { AuthorizationContext } from './AuthorizationContext';

global.crypto = crypto as any;

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

jest.mock('./verifyTokenResponse', () => () => true);

beforeEach(() => {
  mockFetch.mockClear();
});

describe('fetchToken', () => {
  it('should fetch url', async () => {
    const authorizationRequest: AuthorizationRequest = {
      codeVerifier: 'codeVerifier',
      nonce: 'nonce',
      state: 'state',
    };
    const tokenRequest: AuthorizationCodeAccessTokenRequest = {
      code: 'code',
      authorizationRequest,
    };
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
    const fetchResponse: Partial<Response> = {
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'accessToken',
          refresh_token: 'refreshToken',
          id_token: 'idToken',
          expires_in: 1000,
          refresh_expires_in: 10000,
          token_type: 'bearer',
          scope: 'openid',
        }),
    };
    mockFetch.mockImplementationOnce(() => Promise.resolve(fetchResponse));
    await fetchToken({
      clientRegistrationId: 'account',
      authorizationContexts,
      request: tokenRequest,
      clientConfig,
      providerConfig,
    });
    expect(mockFetch).toHaveBeenCalledWith(providerConfig.tokenEndpoint, {
      method: 'POST',
      body: expect.any(Object),
    });

    const req = mockFetch.mock.calls[0][1];
    expect(req.body.get('grant_type')).toEqual('authorization_code');
    expect(req.body.get('client_id')).toEqual('testclient');
    expect(req.body.get('code')).toEqual('code');
    expect(req.body.get('redirect_uri')).toEqual('http://localhost');
    expect(req.body.get('code_verifier')).toEqual('codeVerifier');
    expect(
      authorizationContexts.get('account')?.tokenResponse.accessToken,
    ).toBe('accessToken');
  });

  it('should customize parameters', async () => {
    const authorizationRequest: AuthorizationRequest = {
      codeVerifier: 'codeverifier',
      nonce: 'nonce',
      state: 'state',
    };
    const tokenRequest: AuthorizationCodeAccessTokenRequest = {
      code: 'code',
      authorizationRequest,
    };
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
      tokenRequestCustomizer: (params) => {
        return { ...params, test: 'param' };
      },
    };
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const fetchResponse: Partial<Response> = {
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'accessToken',
          refresh_token: 'refreshToken',
          id_token: 'idToken',
          expires_in: 1000,
          refresh_expires_in: 10000,
          token_type: 'bearer',
          scope: 'openid',
        }),
    };
    mockFetch.mockImplementationOnce(() => Promise.resolve(fetchResponse));
    await fetchToken({
      clientRegistrationId: 'account',
      authorizationContexts,
      request: tokenRequest,
      clientConfig,
      providerConfig,
    });
    expect(mockFetch).toHaveBeenCalledWith(providerConfig.tokenEndpoint, {
      method: 'POST',
      body: expect.any(Object),
    });
    const req = mockFetch.mock.calls[0][1];
    expect(req.body.get('test')).toEqual('param');
  });
});
