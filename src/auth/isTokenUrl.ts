import { AuthConfiguration } from './AuthConfiguration';

function isTokenUrl(url: URL, authConfiguration: AuthConfiguration) {
  return Object.values(authConfiguration.providerRegistry).some(
    (provider) => url.origin + url.pathname === provider.tokenEndpoint,
  );
}

export default isTokenUrl;
