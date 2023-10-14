import { AuthConfiguration } from './AuthConfiguration';
import isTokenUrl from './isTokenUrl';

describe('isTokenUrl', () => {
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
          authorizationEndpoint: '',
          tokenEndpoint:
            'http://localhost:8080/auth/realms/master/protocol/openid-connect/token',
        },
      },
      clientRegistry: {},
      resourceServers: [],
    };
    const matches = isTokenUrl(
      new URL(
        'http://localhost:8080/auth/realms/master/protocol/openid-connect/token',
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
          authorizationEndpoint: '',
          tokenEndpoint:
            'http://localhost:8080/auth/realms/master/protocol/openid-connect/token',
        },
      },
      clientRegistry: {},
      resourceServers: [],
    };
    const matches = isTokenUrl(
      new URL(
        'http://localhost:8080/auth/realms/master/protocol/openid-connect/token/test',
      ),
      authConfiguration,
    );
    expect(matches).toBeFalsy();
  });
});
