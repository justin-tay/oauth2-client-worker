import isRedirectUrl from './isRedirectUrl';

describe('isRedirectUrl', () => {
  it('should match', () => {
    const matches = isRedirectUrl(
      new URL('http://localhost:8080/callback?code=abcd'),
    );
    expect(matches).toBeTruthy();
  });

  it('should not match', () => {
    const matches = isRedirectUrl(new URL('http://localhost:8080/callback'));
    expect(matches).toBeFalsy();
  });
});
