import crypto from 'crypto';
import getCodeVerifier from './getCodeVerifier';

global.crypto = crypto as any;

describe('getCodeVerifier', () => {
  it('should be different', () => {
    expect(getCodeVerifier()).not.toBe(getCodeVerifier());
  });
});
