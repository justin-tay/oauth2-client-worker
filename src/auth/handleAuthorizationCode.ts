import { AuthConfiguration } from './AuthConfiguration';
import { AuthorizationContext } from './AuthorizationContext';
import { AuthorizationRequestContext } from './AuthorizationRequestContext';
import { AuthorizeCallback } from './AuthorizeCallback';
import fetchToken from './fetchToken';

interface HandleAuthorizationCodeParams {
  url: URL;
  authConfiguration: AuthConfiguration;
  authorizationRequests: Map<string, AuthorizationRequestContext>;
  authorizationContexts: Map<string, AuthorizationContext>;
  authorizeCallback?: AuthorizeCallback;
}

const handleAuthorizationCode = (params: HandleAuthorizationCodeParams) => {
  const {
    url,
    authConfiguration,
    authorizationRequests,
    authorizationContexts,
    authorizeCallback,
  } = params;

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (code && state) {
    const authorizationRequestContext = authorizationRequests.get(state);
    if (authorizationRequestContext) {
      console.log('Authorization code:', code);
      // Get the token with the code
      const clientConfig =
        authConfiguration.clientRegistry[
          authorizationRequestContext.clientRegistrationId
        ];
      const providerConfig =
        authConfiguration.providerRegistry[clientConfig.providerRegistrationId];
      const tokenResponse = fetchToken({
        clientRegistrationId: authorizationRequestContext.clientRegistrationId,
        request: {
          code,
          authorizationRequest:
            authorizationRequestContext.authorizationRequest,
        },
        clientConfig,
        providerConfig,
        authorizationContexts,
        authorizeCallback,
      }).then(() => {
        authorizationRequests.delete(state);
        // The following will clear the code and state from the browser location
        return Response.redirect(url.origin + url.pathname);
      });
      return tokenResponse;
    }
  }
  // The following will clear the code and state from the browser location
  return Response.redirect(url.origin + url.pathname);
};

export default handleAuthorizationCode;
