import encodeBase64Url from './encodeBase64Url';

describe('encodeBase64Url', () => {
  it('should match empty string', () => {
    expect(encodeBase64Url(new TextEncoder().encode(''))).toBe('');
  });

  it('should match f', () => {
    expect(encodeBase64Url(new TextEncoder().encode('f'))).toBe('Zg');
  });

  it('should match fo', () => {
    expect(encodeBase64Url(new TextEncoder().encode('fo'))).toBe('Zm8');
  });

  it('should match foo', () => {
    expect(encodeBase64Url(new TextEncoder().encode('foo'))).toBe('Zm9v');
  });

  it('should match foob', () => {
    expect(encodeBase64Url(new TextEncoder().encode('foob'))).toBe('Zm9vYg');
  });

  it('should match fooba', () => {
    expect(encodeBase64Url(new TextEncoder().encode('fooba'))).toBe('Zm9vYmE');
  });

  it('should match foobar', () => {
    expect(encodeBase64Url(new TextEncoder().encode('foobar'))).toBe(
      'Zm9vYmFy',
    );
  });
});
