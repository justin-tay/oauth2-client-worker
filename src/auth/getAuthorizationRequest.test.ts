import crypto from 'crypto';
import getAuthorizationRequest from './getAuthorizationRequest';

global.crypto = crypto;

describe('getAuthorizationRequest', () => {
  it('should contain fields', async () => {
    const authorizationRequest = getAuthorizationRequest();
    expect(authorizationRequest.codeVerifier).toBeTruthy();
    expect(authorizationRequest.nonce).toBeTruthy();
    expect(authorizationRequest.state).toBeTruthy();
  });
});
