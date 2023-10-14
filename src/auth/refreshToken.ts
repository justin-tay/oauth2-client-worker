import { AuthorizationContext } from './AuthorizationContext';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import { RefreshTokenRequest } from './RefreshTokenRequest';
import verifyTokenResponse from './verifyTokenResponse';

interface RefreshTokenParams {
  clientRegistrationId: string;
  request: RefreshTokenRequest;
  clientConfig: ClientConfiguration;
  providerConfig: ProviderConfiguration;
  authorizationContexts: Map<string, AuthorizationContext>;
}

const refreshToken = async (params: RefreshTokenParams) => {
  const {
    clientRegistrationId,
    request,
    clientConfig,
    providerConfig,
    authorizationContexts,
  } = params;

  let urlSearchParams: Record<string, string> = {
    grant_type: 'refresh_token',
    refresh_token: request.refreshToken,
    scope: clientConfig.scopes.join(' '),
    client_id: clientConfig.clientId,
  };

  if (clientConfig.tokenRequestCustomizer) {
    urlSearchParams = clientConfig.tokenRequestCustomizer(urlSearchParams);
  }

  console.log('Refreshing token');
  const response = await fetch(providerConfig.tokenEndpoint, {
    method: 'POST',
    body: new URLSearchParams(urlSearchParams),
  });
  const data = await response.json();
  if (response.ok) {
    const currentTokenResponse = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresIn: data.expires_in,
      refreshExpiresIn: data.refresh_expires_in,
      scope: data.scope,
      tokenType: data.token_type,
    };
    if (
      await verifyTokenResponse({
        tokenResponse: currentTokenResponse,
        authorizationRequest: request.authorizationRequest,
        clientConfig,
        providerConfig,
      })
    ) {
      const authorizationContext =
        authorizationContexts.get(clientRegistrationId);
      if (authorizationContext) {
        authorizationContext.tokenResponse = currentTokenResponse;
      }
      return authorizationContext;
    }
  } else {
    console.error(data);
    const authorizationContext =
      authorizationContexts.get(clientRegistrationId);
    if (authorizationContext) {
      authorizationContext.tokenResponse = {
        ...authorizationContext.tokenResponse,
        accessToken: '',
      };
    }
    return authorizationContext;
  }
  return undefined;
};

export default refreshToken;
