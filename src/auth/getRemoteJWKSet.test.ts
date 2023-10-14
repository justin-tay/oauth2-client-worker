import { createRemoteJWKSet } from 'jose';
import getRemoteJWKSet from './getRemoteJWKSet';

jest.mock('jose');

const mockCreateRemoteJWKSet = createRemoteJWKSet as jest.Mock;

describe('getRemoteJWKSSet', () => {
  it('should cache', () => {
    const jwtVerifyGetKey = jest.fn;
    mockCreateRemoteJWKSet.mockImplementationOnce(() => jwtVerifyGetKey);
    const result = getRemoteJWKSet(
      'http://keycloak/realms/master/protocol/openid-connect/certs',
    );
    expect(result).toBe(jwtVerifyGetKey);
    const cache = getRemoteJWKSet(
      'http://keycloak/realms/master/protocol/openid-connect/certs',
    );
    expect(cache).toBe(jwtVerifyGetKey);
    expect(mockCreateRemoteJWKSet).toBeCalledTimes(1);
  });
});
