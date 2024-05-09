import crypto from 'crypto';
import { AuthorizationRequest } from './AuthorizationRequest';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import getPushedAuthorizationUrl from './getPushedAuthorizationUrl';

global.crypto = crypto as any;

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

beforeEach(() => {
  mockFetch.mockClear();
});

describe('getPushedAuthorizationUrl', () => {
  it('should generate valid url', async () => {
    const authorizationRequest: AuthorizationRequest = {
      codeVerifier: 'codeVerifier',
      nonce: 'nonce',
      state: 'state',
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
    const fetchResponse: Partial<Response> = {
      ok: true,
      json: () =>
        Promise.resolve({
          request_uri: 'urn:example:bwc4JK-ESC0w8acc191e-Y1LTC2',
        }),
    };
    mockFetch.mockImplementationOnce(() => Promise.resolve(fetchResponse));
    const request = await getPushedAuthorizationUrl(
      authorizationRequest,
      clientConfig,
      providerConfig,
    );
    expect(request).toBe(
      'http://keycloak/authorization?request_uri=urn%3Aexample%3Abwc4JK-ESC0w8acc191e-Y1LTC2&client_id=testclient',
    );
    expect(mockFetch).toHaveBeenCalledWith(
      providerConfig.pushedAuthorizationRequestEndpoint,
      {
        method: 'POST',
        body: expect.any(Object),
      },
    );
    const req = mockFetch.mock.calls[0][1];
    expect(req.body.get('response_type')).toEqual('code');
    expect(req.body.get('client_id')).toEqual('testclient');
    expect(req.body.get('redirect_uri')).toEqual('http://localhost');
    expect(req.body.get('scope')).toEqual('openid');
    expect(req.body.get('state')).toEqual('state');
    expect(req.body.get('code_challenge')).toBeTruthy();
    expect(req.body.get('code_challenge_method')).toEqual('S256');
    expect(req.body.get('nonce')).toEqual('nonce');
  });

  it('should use nonce only with scope openid', async () => {
    const authorizationRequest: AuthorizationRequest = {
      codeVerifier: 'codeVerifier',
      nonce: 'nonce',
      state: 'state',
    };
    const providerConfig: ProviderConfiguration = {
      issuer: 'http://keycloak',
      authorizationEndpoint: 'http://keycloak/authorization',
      tokenEndpoint: 'http://keycloak/token',
      pushedAuthorizationRequestEndpoint: 'http://keycloak/par',
    };
    const clientConfig: ClientConfiguration = {
      clientId: 'testclient',
      scopes: ['test'],
      redirectUrl: 'http://localhost',
      providerRegistrationId: 'keycloak',
    };
    const fetchResponse: Partial<Response> = {
      ok: true,
      json: () =>
        Promise.resolve({
          request_uri: 'urn:example:bwc4JK-ESC0w8acc191e-Y1LTC2',
        }),
    };
    mockFetch.mockImplementationOnce(() => Promise.resolve(fetchResponse));
    const request = await getPushedAuthorizationUrl(
      authorizationRequest,
      clientConfig,
      providerConfig,
    );
    expect(request).toBe(
      'http://keycloak/authorization?request_uri=urn%3Aexample%3Abwc4JK-ESC0w8acc191e-Y1LTC2&client_id=testclient',
    );
    expect(mockFetch).toHaveBeenCalledWith(
      providerConfig.pushedAuthorizationRequestEndpoint,
      {
        method: 'POST',
        body: expect.any(Object),
      },
    );
    const req = mockFetch.mock.calls[0][1];
    expect(req.body.get('nonce')).toBe(null);
  });

  it('should customize parameters', async () => {
    const authorizationRequest: AuthorizationRequest = {
      codeVerifier: 'codeVerifier',
      nonce: 'nonce',
      state: 'state',
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
      authorizationRequestCustomizer: (params) => {
        return { ...params, kc_idp_hint: 'google' };
      },
    };
    const fetchResponse: Partial<Response> = {
      ok: true,
      json: () =>
        Promise.resolve({
          request_uri: 'urn:example:bwc4JK-ESC0w8acc191e-Y1LTC2',
        }),
    };
    mockFetch.mockImplementationOnce(() => Promise.resolve(fetchResponse));
    const request = await getPushedAuthorizationUrl(
      authorizationRequest,
      clientConfig,
      providerConfig,
    );
    expect(request).toBe(
      'http://keycloak/authorization?request_uri=urn%3Aexample%3Abwc4JK-ESC0w8acc191e-Y1LTC2&client_id=testclient',
    );
    expect(mockFetch).toHaveBeenCalledWith(
      providerConfig.pushedAuthorizationRequestEndpoint,
      {
        method: 'POST',
        body: expect.any(Object),
      },
    );
    const req = mockFetch.mock.calls[0][1];
    expect(req.body.get('kc_idp_hint')).toEqual('google');
  });
});
