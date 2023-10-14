import { AuthorizationCodeAccessTokenRequest } from './AuthorizationCodeAccessTokenRequest';
import { AuthorizationContext } from './AuthorizationContext';
import { AuthorizeCallback } from './AuthorizeCallback';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import verifyTokenResponse from './verifyTokenResponse';

interface FetchTokenParams {
  clientRegistrationId: string;
  request: AuthorizationCodeAccessTokenRequest;
  clientConfig: ClientConfiguration;
  providerConfig: ProviderConfiguration;
  authorizationContexts: Map<string, AuthorizationContext>;
  authorizeCallback?: AuthorizeCallback;
}

const fetchToken = async (params: FetchTokenParams) => {
  const {
    clientRegistrationId,
    request,
    clientConfig,
    providerConfig,
    authorizationContexts,
    authorizeCallback,
  } = params;

  let urlSearchParams: Record<string, string> = {
    grant_type: 'authorization_code',
    client_id: clientConfig.clientId,
    code: request.code,
    redirect_uri: clientConfig.redirectUrl,
    code_verifier: request.authorizationRequest.codeVerifier,
  };

  if (clientConfig.tokenRequestCustomizer) {
    urlSearchParams = clientConfig.tokenRequestCustomizer(urlSearchParams);
  }

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
      tokenType: data.token_type,
      scope: data.scope,
    };
    if (
      await verifyTokenResponse({
        tokenResponse: currentTokenResponse,
        authorizationRequest: request.authorizationRequest,
        clientConfig,
        providerConfig,
      })
    ) {
      authorizationContexts.set(clientRegistrationId, {
        authorizationRequest: request.authorizationRequest,
        tokenResponse: currentTokenResponse,
      });
      if (authorizeCallback) {
        authorizeCallback({
          idToken: currentTokenResponse.idToken,
          clientRegistrationId,
          providerConfig,
          clientConfig,
        });
      }
    }
  } else {
    console.error(data);
  }
};

export default fetchToken;
