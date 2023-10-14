import { AuthorizationRequest } from './AuthorizationRequest';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import getAuthorizationUrl from './getAuthorizationUrl';
import getPushedAuthorizationUrl from './getPushedAuthorizationUrl';

/**
 * Gets the authorization request URL.
 *
 * @returns the authorization request URL
 */
const getAuthorizationRequestUrl = (
  authorizationRequest: AuthorizationRequest,
  clientConfig: ClientConfiguration,
  providerConfig: ProviderConfiguration,
) => {
  return providerConfig.pushedAuthorizationRequestEndpoint
    ? getPushedAuthorizationUrl(
        authorizationRequest,
        clientConfig,
        providerConfig,
      )
    : getAuthorizationUrl(authorizationRequest, clientConfig, providerConfig);
};

export default getAuthorizationRequestUrl;
