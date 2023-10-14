import crypto from 'crypto';
import { AuthorizationRequestContext } from './AuthorizationRequestContext';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import authorize from './authorize';
import getAuthorizationRequestUrl from './getAuthorizationRequestUrl';

global.crypto = crypto;

jest.mock('./getAuthorizationRequestUrl');

const mockGetAuthorizationRequestUrl = getAuthorizationRequestUrl as jest.Mock;

beforeEach(() => {
  mockGetAuthorizationRequestUrl.mockClear();
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

describe('authorize', () => {
  it('should set status 401 and location header', async () => {
    const authorizationRequests = new Map<
      string,
      AuthorizationRequestContext
    >();
    mockGetAuthorizationRequestUrl.mockImplementation(() =>
      Promise.resolve('http://keycloak/authorization'),
    );
    const response = await authorize({
      authorizationRequests,
      clientConfig,
      providerConfig,
      clientRegistrationId: 'account',
    });
    expect(response.status).toBe(401);
    expect(response.statusText).toBe('401');
    expect(response.headers.get('Location')).toBe(
      'http://keycloak/authorization',
    );
  });
});
