import crypto from 'crypto';
import getState from './getState';

global.crypto = crypto as any;

describe('getState', () => {
  it('should be different', () => {
    expect(getState()).not.toBe(getState());
  });
});
