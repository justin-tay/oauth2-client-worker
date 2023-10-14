const withBearer = (request: Request, token?: string) => {
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${token}`);
  const modifiedRequestInit: RequestInit = { headers };
  return new Request(request, modifiedRequestInit);
};

export default withBearer;
