import crypto from 'crypto';
import { AuthorizationRequest } from './AuthorizationRequest';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import getAuthorizationUrl from './getAuthorizationUrl';

global.crypto = crypto;

describe('getAuthorizationUrl', () => {
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
    const request = await getAuthorizationUrl(
      authorizationRequest,
      clientConfig,
      providerConfig,
    );
    expect(request).toMatch(
      /http:\/\/keycloak\/authorization\?response_type=code&client_id=testclient&redirect_uri=http%3A%2F%2Flocalhost&scope=openid&state=state&code_challenge=.*&code_challenge_method=S256&nonce=nonce/,
    );
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
    const request = await getAuthorizationUrl(
      authorizationRequest,
      clientConfig,
      providerConfig,
    );
    expect(request).toMatch(
      /http:\/\/keycloak\/authorization\?response_type=code&client_id=testclient&redirect_uri=http%3A%2F%2Flocalhost&scope=test&state=state&code_challenge=.*&code_challenge_method=S256/,
    );
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
    const request = await getAuthorizationUrl(
      authorizationRequest,
      clientConfig,
      providerConfig,
    );
    expect(request).toMatch(
      /http:\/\/keycloak\/authorization\?response_type=code&client_id=testclient&redirect_uri=http%3A%2F%2Flocalhost&scope=openid&state=state&code_challenge=.*&code_challenge_method=S256&nonce=nonce&kc_idp_hint=google/,
    );
  });
});
