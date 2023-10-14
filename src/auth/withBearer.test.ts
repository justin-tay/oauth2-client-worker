import withBearer from './withBearer';

describe('withBearer', () => {
  it('should add bearer', () => {
    const request = new Request(new URL('http://localhost'));
    const bearer = withBearer(request, 'token');
    expect(bearer.headers.get('authorization')).toBe('Bearer token');
  });
});
