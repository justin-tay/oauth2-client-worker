import { AuthConfiguration } from './AuthConfiguration';

function isAuthorizationUrl(url: URL, authConfiguration: AuthConfiguration) {
  return Object.values(authConfiguration.providerRegistry).some(
    (provider) => url.origin + url.pathname === provider.authorizationEndpoint,
  );
}

export default isAuthorizationUrl;
