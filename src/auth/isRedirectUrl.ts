function isRedirectUrl(url: URL) {
  return url.searchParams.has('code');
}

export default isRedirectUrl;
