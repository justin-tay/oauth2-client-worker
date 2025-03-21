import { createRemoteJWKSet } from 'jose';
import getRemoteJWKSet from './getRemoteJWKSet';
import { Mock } from 'vitest';

vi.mock('jose');

const mockCreateRemoteJWKSet = createRemoteJWKSet as Mock;

describe('getRemoteJWKSSet', () => {
  it('should cache', () => {
    const jwtVerifyGetKey = vi.fn;
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
