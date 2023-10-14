import { AuthConfiguration } from './AuthConfiguration';
import isAuthorizationUrl from './isAuthorizationUrl';

describe('isAuthorizationUrl', () => {
  it('should match', () => {
    const authConfiguration: AuthConfiguration = {
      providerRegistry: {
        google: {
          issuer: '',
          authorizationEndpoint: '',
          tokenEndpoint: '',
        },
        keycloak: {
          issuer: '',
          authorizationEndpoint:
            'http://localhost:8080/auth/realms/master/protocol/openid-connect/auth',
          tokenEndpoint: '',
        },
      },
      clientRegistry: {},
      resourceServers: [],
    };
    const matches = isAuthorizationUrl(
      new URL(
        'http://localhost:8080/auth/realms/master/protocol/openid-connect/auth',
      ),
      authConfiguration,
    );
    expect(matches).toBeTruthy();
  });

  it('should not match', () => {
    const authConfiguration: AuthConfiguration = {
      providerRegistry: {
        google: {
          issuer: '',
          authorizationEndpoint: '',
          tokenEndpoint: '',
        },
        keycloak: {
          issuer: '',
          authorizationEndpoint:
            'http://localhost:8080/auth/realms/master/protocol/openid-connect/auth',
          tokenEndpoint: '',
        },
      },
      clientRegistry: {},
      resourceServers: [],
    };
    const matches = isAuthorizationUrl(
      new URL(
        'http://localhost:8080/auth/realms/master/protocol/openid-connect/token/test',
      ),
      authConfiguration,
    );
    expect(matches).toBeFalsy();
  });
});
