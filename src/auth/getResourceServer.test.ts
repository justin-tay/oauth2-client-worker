import { AuthConfiguration } from './AuthConfiguration';
import getResourceServer from './getResourceServer';

describe('getResourceServer', () => {
  it('should match', () => {
    const authConfiguration: AuthConfiguration = {
      providerRegistry: {},
      clientRegistry: {},
      resourceServers: [
        {
          path: /http:\/\/localhost:8080\/auth\/admin\/realms\/master\/.*/,
          clientRegistrationId: 'account',
        },
      ],
    };
    const resourceServer = getResourceServer({
      url: new URL(
        'http://localhost:8080/auth/admin/realms/master/users?first=0&max=999999&enabled=true',
      ),
      authConfiguration,
    });
    expect(resourceServer).toBeTruthy();
    expect(resourceServer?.clientRegistrationId).toBe('account');
  });

  it('should not match', () => {
    const authConfiguration: AuthConfiguration = {
      providerRegistry: {},
      clientRegistry: {},
      resourceServers: [
        {
          path: /http:\/\/localhost:8080\/auth\/admin\/realms\/master\/.*/,
          clientRegistrationId: 'account',
        },
      ],
    };
    const resourceServer = getResourceServer({
      url: new URL(
        'http://localhost:8080/auth/realms/master/protocol/openid-connect/auth',
      ),
      authConfiguration,
    });
    expect(resourceServer).toBeFalsy();
  });
});
