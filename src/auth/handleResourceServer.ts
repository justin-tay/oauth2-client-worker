import { AuthConfiguration } from './AuthConfiguration';
import { AuthorizationContext } from './AuthorizationContext';
import { AuthorizationRequestContext } from './AuthorizationRequestContext';
import { EndSessionCallback } from './EndSessionCallback';
import authorize from './authorize';
import fetchWithBearer from './fetchWithBearer';
import getResourceServerContext from './getResourceServerContext';

interface HandleResourceServerParams {
  request: Request;
  authConfiguration: AuthConfiguration;
  authorizationRequests: Map<string, AuthorizationRequestContext>;
  authorizationContexts: Map<string, AuthorizationContext>;
  endSessionCallback?: EndSessionCallback;
}

const handleResourceServer = (params: HandleResourceServerParams) => {
  const {
    request,
    authConfiguration,
    authorizationRequests,
    authorizationContexts,
    endSessionCallback,
  } = params;
  const url = new URL(request.url);
  const resourceServerContext = getResourceServerContext({
    url,
    authConfiguration,
  });
  if (resourceServerContext) {
    const { clientRegistrationId, clientConfig, providerConfig } =
      resourceServerContext;
    /*
     * Intercept calls from the frontend to the resource server
     */
    console.log(
      'Intercepted resource request:',
      url.origin + url.pathname,
      'for client',
      clientRegistrationId,
    );
    const authorizationContext =
      authorizationContexts.get(clientRegistrationId);
    if (authorizationContext?.tokenResponse?.accessToken) {
      console.log('Adding access token to request');
      return fetchWithBearer({
        request,
        clientRegistrationId,
        authorizationContext,
        clientConfig,
        providerConfig,
        authorizationContexts,
      }).then((response) => {
        if (response.statusText === '401') {
          if (endSessionCallback) {
            endSessionCallback({
              idToken: authorizationContext.tokenResponse.idToken!,
              clientRegistrationId,
              clientConfig,
              providerConfig,
            });
          }
          return authorize({
            authorizationRequests,
            clientConfig,
            providerConfig,
            clientRegistrationId,
          });
        }
        return response;
      });
    }
    console.log('No access token to add to request');
    return authorize({
      authorizationRequests,
      clientConfig,
      providerConfig,
      clientRegistrationId,
    });
  }
  // Not a resource server request
  return undefined;
};

export default handleResourceServer;
