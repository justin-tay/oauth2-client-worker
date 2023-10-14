import { jwtVerify } from 'jose';
import { TokenResponse } from './TokenResponse';
import { AuthorizationRequest } from './AuthorizationRequest';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import verifyTokenResponse from './verifyTokenResponse';
import getRemoteJWKSet from './getRemoteJWKSet';

jest.mock('./getRemoteJWKSet');
jest.mock('jose');

const mockGetRemoteJWKSet = getRemoteJWKSet as jest.Mock;
const mockJwtVerify = jwtVerify as jest.Mock;

beforeEach(() => {
  mockGetRemoteJWKSet.mockClear();
  mockJwtVerify.mockClear();
});

describe('verifyTokenResponse', () => {
  it('should verify both access token and id token', async () => {
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
      jwksUri: 'http://keycloak/jwks',
    };
    const clientConfig: ClientConfiguration = {
      clientId: 'testclient',
      scopes: ['openid'],
      redirectUrl: 'http://localhost',
      providerRegistrationId: 'keycloak',
      audience: 'account',
    };
    const tokenResponse: TokenResponse = {
      accessToken: 'accessToken',
      idToken: 'idToken',
      tokenType: 'bearer',
    };
    const response = {
      payload: {
        nonce: 'nonce',
      },
    };
    mockJwtVerify.mockImplementation(() => Promise.resolve(response));
    mockGetRemoteJWKSet.mockImplementation(() => jest.fn());
    const verified = await verifyTokenResponse({
      authorizationRequest,
      clientConfig,
      providerConfig,
      tokenResponse,
    });
    expect(verified).toBeTruthy();
    expect(mockJwtVerify).toBeCalledTimes(2);
  });

  it('should not verify if no jwks', async () => {
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
      jwksUri: 'http://keycloak/jwks',
    };
    const clientConfig: ClientConfiguration = {
      clientId: 'testclient',
      scopes: ['openid'],
      redirectUrl: 'http://localhost',
      providerRegistrationId: 'keycloak',
      audience: 'account',
    };
    const tokenResponse: TokenResponse = {
      accessToken: 'accessToken',
      tokenType: 'bearer',
    };
    mockGetRemoteJWKSet.mockImplementation(() => null);
    const verified = await verifyTokenResponse({
      authorizationRequest,
      clientConfig,
      providerConfig,
      tokenResponse,
    });
    expect(verified).toBeFalsy();
    expect(mockJwtVerify).toBeCalledTimes(0);
  });

  it('should fail verification if jwt verification fails', async () => {
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
      jwksUri: 'http://keycloak/jwks',
    };
    const clientConfig: ClientConfiguration = {
      clientId: 'testclient',
      scopes: ['openid'],
      redirectUrl: 'http://localhost',
      providerRegistrationId: 'keycloak',
      audience: 'account',
    };
    const tokenResponse: TokenResponse = {
      accessToken: 'accessToken',
      tokenType: 'bearer',
    };
    mockGetRemoteJWKSet.mockImplementation(() => jest.fn());
    mockJwtVerify.mockImplementation(() => Promise.resolve());
    const verified = await verifyTokenResponse({
      authorizationRequest,
      clientConfig,
      providerConfig,
      tokenResponse,
    });
    expect(verified).toBeFalsy();
    expect(mockJwtVerify).toBeCalledTimes(1);
  });
});
