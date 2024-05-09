import crypto from 'crypto';
import handleResourceServer from './handleResourceServer';
import { ProviderConfiguration } from './ProviderConfiguration';
import { ClientConfiguration } from './ClientConfiguration';
import { AuthConfiguration } from './AuthConfiguration';
import { AuthorizationContext } from './AuthorizationContext';
import { AuthorizationRequestContext } from './AuthorizationRequestContext';
import authorize from './authorize';

global.crypto = crypto as any;
global.fetch = jest.fn();

jest.mock('./authorize');

const mockFetch = global.fetch as jest.Mock;
const mockAuthorize = authorize as jest.Mock;

beforeEach(() => {
  mockFetch.mockClear();
  mockAuthorize.mockClear();
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

describe('handleResourceServer', () => {
  it('should set access token', async () => {
    const authorizationRequests = new Map<
      string,
      AuthorizationRequestContext
    >();
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
    const request = new Request('http://resourceserver/resource/users');
    const fetchResponse: Partial<Response> = {
      statusText: '200',
    };
    mockFetch.mockImplementation(() => Promise.resolve(fetchResponse));

    await handleResourceServer({
      request,
      authConfiguration,
      authorizationContexts,
      authorizationRequests,
    });

    const modifiedRequest: Request = mockFetch.mock.calls[0][0];
    expect(modifiedRequest.headers.get('Authorization')).toBe(
      'Bearer accessToken',
    );
  });

  it('should authorize if no access token', async () => {
    const authorizationRequests = new Map<
      string,
      AuthorizationRequestContext
    >();
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const authorizationContext: Partial<AuthorizationContext> = {};
    authorizationContexts.set(
      'account',
      authorizationContext as AuthorizationContext,
    );
    const request = new Request('http://resourceserver/resource/users');

    mockAuthorize.mockImplementation(() => Promise.resolve());
    await handleResourceServer({
      request,
      authConfiguration,
      authorizationContexts,
      authorizationRequests,
    });

    expect(mockAuthorize).toBeCalledTimes(1);
  });

  it('should not handle if no matching path', async () => {
    const authorizationRequests = new Map<
      string,
      AuthorizationRequestContext
    >();
    const authorizationContexts = new Map<string, AuthorizationContext>();
    const authorizationContext: Partial<AuthorizationContext> = {};
    authorizationContexts.set(
      'account',
      authorizationContext as AuthorizationContext,
    );
    const request = new Request('http://resourceserver2/resource/users');

    mockAuthorize.mockImplementation(() => Promise.resolve());
    const response = await handleResourceServer({
      request,
      authConfiguration,
      authorizationContexts,
      authorizationRequests,
    });

    expect(response).toBeFalsy();
  });
});
