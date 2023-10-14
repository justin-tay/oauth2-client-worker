import { AuthConfiguration } from './AuthConfiguration';
import { AuthorizationContext } from './AuthorizationContext';
import { EndSessionContext } from './EndSessionContext';

function getEndSessionContext(
  url: URL,
  authConfiguration: AuthConfiguration,
  authorizationContexts: Map<string, AuthorizationContext>,
): EndSessionContext | null {
  const foundProvider = Object.entries(authConfiguration.providerRegistry).find(
    (entry) => {
      const [, provider] = entry;
      return url.origin + url.pathname === provider.endSessionEndpoint;
    },
  );
  if (foundProvider) {
    const [providerRegistrationId] = foundProvider;
    const foundClient = Object.entries(authConfiguration.clientRegistry).find(
      (entry) => {
        const [, client] = entry;
        return client.providerRegistrationId === providerRegistrationId;
      },
    );
    if (foundClient) {
      const [clientRegistrationId] = foundClient;
      const authorizationContext =
        authorizationContexts.get(clientRegistrationId);
      if (authorizationContext?.tokenResponse?.idToken) {
        const result = new URL(url);
        result.searchParams.set(
          'id_token_hint',
          authorizationContext.tokenResponse.idToken,
        );
        const client = authConfiguration.clientRegistry[clientRegistrationId];
        if (client?.postLogoutRedirectUri) {
          result.searchParams.set(
            'post_logout_redirect_uri',
            client.postLogoutRedirectUri,
          );
        }
        return {
          url: result,
          idToken: authorizationContext.tokenResponse.idToken,
          clientRegistrationId,
          clientConfig: foundClient[1],
          providerConfig: foundProvider[1],
        };
      }
    }
  }
  return null;
}

export default getEndSessionContext;
