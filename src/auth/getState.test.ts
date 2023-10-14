import crypto from 'crypto';
import getState from './getState';

global.crypto = crypto;

describe('getState', () => {
  it('should be different', () => {
    expect(getState()).not.toBe(getState());
  });
});
