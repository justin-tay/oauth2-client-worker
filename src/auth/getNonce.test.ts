import crypto from 'crypto';
import getNonce from './getNonce';

global.crypto = crypto;

describe('getNonce', () => {
  it('should be different', () => {
    expect(getNonce()).not.toBe(getNonce());
  });
});
